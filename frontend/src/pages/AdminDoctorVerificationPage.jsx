import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Clock, Shield, User } from 'lucide-react';
import { adminService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Avatar from '../components/common/Avatar';
import Badge from '../components/common/Badge';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';

const AdminDoctorVerificationPage = () => {
  const { toast } = useToast();
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [verifiedDoctors, setVerifiedDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('unverified');

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const [unverified, verified] = await Promise.all([
        adminService.getUnverifiedDoctors(),
        adminService.getVerifiedDoctors()
      ]);
      setUnverifiedDoctors(unverified.doctors || []);
      setVerifiedDoctors(verified.doctors || []);
    } catch (error) {
      toast.error('Failed to fetch doctors');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleVerify = async (doctorId) => {
    try {
      await adminService.verifyDoctor(doctorId);
      toast.success('Doctor verified successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to verify doctor');
      console.error(error);
    }
  };

  const handleReject = async (doctorId) => {
    try {
      await adminService.rejectDoctor(doctorId, 'Rejected by admin');
      toast.success('Doctor rejected successfully');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to reject doctor');
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="flex items-center gap-2 text-2xl font-bold">
          <Shield className="h-8 w-8 text-primary-600" />
          Doctor Verification
        </h2>
        <p className="text-gray-500">
          Review and verify doctor applications
        </p>
      </div>

      <div className="flex gap-2 border-b">
        <button
          onClick={() => setActiveTab('unverified')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'unverified'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500'
          }`}
        >
          Pending ({unverifiedDoctors.length})
        </button>
        <button
          onClick={() => setActiveTab('verified')}
          className={`px-4 py-2 font-medium ${
            activeTab === 'verified'
              ? 'border-b-2 border-primary-600 text-primary-600'
              : 'text-gray-500'
          }`}
        >
          Verified ({verifiedDoctors.length})
        </button>
      </div>

      {activeTab === 'unverified' && (
        <div className="space-y-4">
          {unverifiedDoctors.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-gray-500">
                No pending doctor verifications
              </div>
            </Card>
          ) : (
            unverifiedDoctors.map((doctor) => (
              <Card key={doctor._id}>
                <div className="flex items-start gap-4">
                  <Avatar
                    firstName={doctor.user?.firstName}
                    lastName={doctor.user?.lastName}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{doctor.user?.email}</p>
                        <p className="text-sm text-gray-500">{doctor.user?.phone}</p>
                      </div>
                      <Badge className="bg-yellow-100 text-yellow-800">
                        Pending
                      </Badge>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Specialization:</span>{' '}
                        {doctor.specialization}
                      </div>
                      <div>
                        <span className="font-medium">Experience:</span>{' '}
                        {doctor.experience} years
                      </div>
                      <div>
                        <span className="font-medium">Hospital:</span>{' '}
                        {doctor.hospital}
                      </div>
                      <div>
                        <span className="font-medium">License:</span>{' '}
                        {doctor.licenseNumber}
                      </div>
                      <div>
                        <span className="font-medium">City:</span> {doctor.city}
                      </div>
                      <div>
                        <span className="font-medium">Consultation Fee:</span> $
                        {doctor.consultationFee}
                      </div>
                    </div>
                    {doctor.bio && (
                      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                        {doctor.bio}
                      </p>
                    )}
                    <div className="mt-4 flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleVerify(doctor._id)}
                        icon={CheckCircle}
                      >
                        Verify
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleReject(doctor._id)}
                        icon={XCircle}
                      >
                        Reject
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeTab === 'verified' && (
        <div className="space-y-4">
          {verifiedDoctors.length === 0 ? (
            <Card>
              <div className="py-8 text-center text-gray-500">
                No verified doctors yet
              </div>
            </Card>
          ) : (
            verifiedDoctors.map((doctor) => (
              <Card key={doctor._id}>
                <div className="flex items-center gap-4">
                  <Avatar
                    firstName={doctor.user?.firstName}
                    lastName={doctor.user?.lastName}
                    size="lg"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          Dr. {doctor.user?.firstName} {doctor.user?.lastName}
                        </h3>
                        <p className="text-sm text-gray-500">{doctor.user?.email}</p>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Verified
                      </Badge>
                    </div>
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                      {doctor.specialization} • {doctor.hospital} • {doctor.city}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDoctorVerificationPage;