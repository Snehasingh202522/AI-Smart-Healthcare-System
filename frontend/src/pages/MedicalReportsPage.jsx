import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FileText, Upload, Download, Trash2, Eye, Filter, Search, FileImage, File } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { medicalReportService } from '../services/authService';
import { useToast } from '../hooks/useToast';
import Card from '../components/common/Card';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Spinner from '../components/common/Spinner';
import Badge from '../components/common/Badge';
import { formatDateTime } from '../utils/helpers';

const MedicalReportsPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [filter, setFilter] = useState('all');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      reportType: 'lab-result',
      description: '',
      doctor: '',
      reportDate: new Date().toISOString().split('T')[0],
      isConfidential: false,
      tags: '',
    },
  });

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await medicalReportService.getPatientReports({ 
        reportType: filter !== 'all' ? filter : undefined 
      });
      setReports(response.data.reports);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to fetch reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedFile) {
      toast.error('Please select a file to upload');
      return;
    }

    setUploadLoading(true);
    try {
      // For now, we'll use a mock file URL since Cloudinary integration is for later
      const fileUrl = URL.createObjectURL(selectedFile);
      
      await medicalReportService.uploadReport({
        ...data,
        fileUrl,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        tags: data.tags ? data.tags.split(',').map(t => t.trim()) : [],
      });
      
      toast.success('Medical report uploaded successfully');
      reset();
      setSelectedFile(null);
      setShowUploadForm(false);
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload report');
    } finally {
      setUploadLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    
    try {
      await medicalReportService.deleteReport(id);
      toast.success('Report deleted successfully');
      fetchReports();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete report');
    }
  };

  const handleDownload = (report) => {
    window.open(report.fileUrl, '_blank');
  };

  const getReportTypeColor = (type) => {
    switch (type) {
      case 'lab-result':
        return 'bg-blue-100 text-blue-800';
      case 'imaging':
        return 'bg-purple-100 text-purple-800';
      case 'prescription':
        return 'bg-green-100 text-green-800';
      case 'discharge-summary':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportTypeLabel = (type) => {
    switch (type) {
      case 'lab-result':
        return 'Lab Result';
      case 'imaging':
        return 'Imaging';
      case 'prescription':
        return 'Prescription';
      case 'discharge-summary':
        return 'Discharge Summary';
      default:
        return 'Other';
    }
  };

  const getFileIcon = (mimeType) => {
    if (mimeType?.startsWith('image/')) {
      return FileImage;
    }
    return File;
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const filteredReports = reports.filter((report) => {
    if (filter === 'all') return true;
    return report.reportType === filter;
  });

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Medical Reports</h2>
          <p className="mt-1 text-gray-500">Manage your medical records and documents</p>
        </div>
        <Button onClick={() => setShowUploadForm(true)} icon={Upload}>
          Upload Report
        </Button>
      </div>

      {showUploadForm && (
        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Upload Medical Report</h3>
            <button
              onClick={() => {
                setShowUploadForm(false);
                setSelectedFile(null);
                reset();
              }}
              className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Report Title"
                {...register('title', {
                  required: 'Title is required',
                  minLength: { value: 3, message: 'Title must be at least 3 characters' },
                })}
                error={errors.title?.message}
                placeholder="e.g., Blood Test Results"
              />
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Report Type
                </label>
                <select
                  {...register('reportType')}
                  className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                >
                  <option value="lab-result">Lab Result</option>
                  <option value="imaging">Imaging (X-Ray, MRI, CT)</option>
                  <option value="prescription">Prescription</option>
                  <option value="discharge-summary">Discharge Summary</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Report Date"
                type="date"
                {...register('reportDate')}
                error={errors.reportDate?.message}
              />
              <Input
                label="Doctor ID (Optional)"
                {...register('doctor')}
                placeholder="Enter doctor ID if applicable"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Upload File
              </label>
              <div className="flex items-center gap-4">
                <label className="flex flex-1 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-6 transition-colors hover:border-primary-500 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-primary-500 dark:hover:bg-gray-700">
                  <Upload className="h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">
                    {selectedFile ? selectedFile.name : 'Click to select file'}
                  </p>
                  <p className="text-xs text-gray-400">PDF, Images up to 10MB</p>
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    accept=".pdf,image/*"
                    className="hidden"
                  />
                </label>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedFile(null)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <Input
              label="Description (Optional)"
              {...register('description')}
              placeholder="Brief description of the report"
            />

            <Input
              label="Tags (Optional)"
              {...register('tags')}
              placeholder="Comma-separated tags (e.g., blood, urgent, annual)"
            />

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                {...register('isConfidential')}
                className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <label className="text-sm text-gray-700 dark:text-gray-300">
                Mark as confidential
              </label>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" loading={uploadLoading} disabled={!selectedFile}>
                Upload Report
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowUploadForm(false);
                  setSelectedFile(null);
                  reset();
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-primary-500 focus:outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="all">All Reports</option>
              <option value="lab-result">Lab Results</option>
              <option value="imaging">Imaging</option>
              <option value="prescription">Prescriptions</option>
              <option value="discharge-summary">Discharge Summaries</option>
              <option value="other">Other</option>
            </select>
          </div>
          <p className="text-sm text-gray-500">
            {filteredReports.length} report{filteredReports.length !== 1 ? 's' : ''}
          </p>
        </div>

        {filteredReports.length === 0 ? (
          <div className="py-12 text-center">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <p className="mt-2 text-gray-500">No medical reports found</p>
            {!showUploadForm && (
              <Button
                onClick={() => setShowUploadForm(true)}
                variant="outline"
                className="mt-4"
                icon={Upload}
              >
                Upload Your First Report
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReports.map((report) => {
              const FileIcon = getFileIcon(report.mimeType);
              return (
                <div
                  key={report._id}
                  className="flex flex-col gap-4 rounded-lg border border-gray-200 p-4 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400">
                      <FileIcon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {report.title}
                      </h4>
                      <p className="text-sm text-gray-500">{report.description || 'No description'}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge className={getReportTypeColor(report.reportType)}>
                          {getReportTypeLabel(report.reportType)}
                        </Badge>
                        {report.isConfidential && (
                          <Badge className="bg-red-100 text-red-800">Confidential</Badge>
                        )}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-xs text-gray-500">
                        <span>{formatDateTime(report.reportDate)}</span>
                        <span>{formatFileSize(report.fileSize)}</span>
                        {report.doctor && (
                          <span>Dr. {report.doctor.firstName} {report.doctor.lastName}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 sm:items-end">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDownload(report)}
                      icon={Download}
                    >
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(report._id)}
                      icon={Trash2}
                      className="text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default MedicalReportsPage;
