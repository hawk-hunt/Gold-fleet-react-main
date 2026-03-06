import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaCircle, FaClock, FaArrowRight } from 'react-icons/fa';
import { api } from '../services/api';

export default function MaintenanceWorkflow() {
  const [stats, setStats] = useState({
    pendingInspections: 0,
    issuesFromInspections: 0,
    pendingServices: 0,
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadWorkflowStats();
  }, []);

  const loadWorkflowStats = async () => {
    try {
      const [inspectionsRes, issuesRes, servicesRes] = await Promise.all([
        api.getInspections(),
        api.getIssues(),
        api.getServices(),
      ]);

      const inspections = inspectionsRes.data || [];
      const issues = issuesRes.data || [];
      const services = servicesRes.data || [];

      setStats({
        pendingInspections: inspections.filter(i => i.result !== 'pass').length,
        issuesFromInspections: issues.filter(i => i.status !== 'resolved').length,
        pendingServices: services.filter(s => s.status !== 'completed').length,
      });
    } catch (err) {
      console.error('Failed to load workflow stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const workflowSteps = [
    {
      step: 1,
      title: 'Vehicle Inspection',
      description: 'Inspect vehicle and identify issues',
      icon: <FaCircle className="text-blue-600" />,
      link: '/inspections',
      count: stats.pendingInspections,
      color: 'bg-blue-50 border-blue-200',
    },
    {
      step: 2,
      title: 'Log Issues',
      description: 'Record problems found during inspection',
      icon: <FaCircle className="text-orange-600" />,
      link: '/issues',
      count: stats.issuesFromInspections,
      color: 'bg-orange-50 border-orange-200',
    },
    {
      step: 3,
      title: 'Schedule Services',
      description: 'Create service orders to fix identified issues',
      icon: <FaCheckCircle className="text-green-600" />,
      link: '/services',
      count: stats.pendingServices,
      color: 'bg-green-50 border-green-200',
    },
  ];

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading workflow status...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Maintenance Workflow</h2>
        <p className="text-gray-600 mb-6">Follow this workflow to prevent mistakes and ensure proper maintenance scheduling.</p>

        <div className="space-y-4">
          {workflowSteps.map((item, index) => (
            <div key={item.step}>
              <Link
                to={item.link}
                className={`block ${item.color} border rounded-lg p-4 hover:shadow-md transition-shadow`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="inline-block bg-gray-200 text-gray-700 rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                          {item.step}
                        </span>
                        <h3 className="text-lg font-semibold text-gray-900">{item.title}</h3>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{item.count}</div>
                      <div className="text-xs text-gray-600">Pending</div>
                    </div>
                    <FaArrowRight className="text-gray-400" size={20} />
                  </div>
                </div>
              </Link>

              {index < workflowSteps.length - 1 && (
                <div className="flex justify-center py-2">
                  <FaArrowRight className="text-gray-300 text-2xl rotate-90" />
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">Workflow Tips:</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>✓ Inspect vehicles regularly</li>
            <li>✓ Create issues for any problems found</li>
            <li>✓ Schedule services immediately for safety issues</li>
            <li>✓ Update service status as work progresses</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
