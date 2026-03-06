import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency } from '../utils/formatters';
import ListPage from '../components/ListPage';

export default function Services() {
  return (
    <ListPage
      title="Services"
      fetchData={async () => {
        try {
          const response = await api.getServices();
          console.log('📡 Raw API response:', response);
          console.log('📡 response.data:', response?.data);
          
          if (response && response.data && Array.isArray(response.data)) {
            console.log('✅ Services count:', response.data.length);
            if (response.data.length > 0) {
              console.log('✅ First service:', JSON.stringify(response.data[0], null, 2));
            }
          } else {
            console.warn('⚠️ Response structure unexpected:', response);
          }
          
          return response?.data;
        } catch (err) {
          console.error('❌ API error:', err);
          throw err;
        }
      }}
      deleteItem={api.deleteService}
      createUrl="/services/create"
      viewUrl={id => `/services/${id}`}
      editUrl={id => `/services/${id}/edit`}
      columns={[
        { label: 'Service Type', transform: s => {
            console.log('Transform Service Type:', s.service_type, 'Result:', s.service_type?.replace('_',' ') || 'N/A');
            return s.service_type?.replace('_',' ') || 'N/A';
          }},
        { label: 'Vehicle', transform: s => {
            const vehicle = `${s.vehicle?.make || ''} ${s.vehicle?.model || ''} (${s.vehicle?.license_plate || '-'})`;
            console.log('Transform Vehicle:', vehicle);
            return vehicle;
          }},
        { label: 'Date', transform: s => {
            const date = s.service_date ? new Date(s.service_date).toLocaleDateString() : 'Invalid';
            console.log('Transform Date:', s.service_date, 'Result:', date);
            return date;
          }},
        { label: 'Status', transform: s => (
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              s.status === 'completed' ? 'bg-green-100 text-green-800' : s.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {s.status?.replace('_',' ') || 'Pending'}
            </span>
          )},
        { label: 'Cost', transform: s => formatCurrency(s.cost) },
      ]}
    />
  );
}
