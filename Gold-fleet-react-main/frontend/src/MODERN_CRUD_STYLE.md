/**
 * MODERN CRUD STYLE - USAGE EXAMPLES
 * 
 * Replace your default ListPage and form components with these modern versions
 */

// ============================================
// EXAMPLE 1: Modern List Page Usage
// ============================================
/*
import ModernListPage from '../components/ModernListPage';
import { api } from '../services/api';
import { FaTruck } from 'react-icons/fa';

export default function Vehicles() {
  return (
    <ModernListPage
      title="Vehicles"
      description="Manage your fleet of vehicles"
      fetchData={() => api.getVehicles().then(r => r.data)}
      deleteItem={api.deleteVehicle}
      createUrl="/vehicles/create"
      viewUrl={(id) => `/vehicles/${id}`}
      editUrl={(id) => `/vehicles/${id}/edit`}
      icon={FaTruck}
      columns={[
        { label: 'License Plate', key: 'license_plate' },
        { label: 'Make/Model', transform: v => `${v.make || ''} ${v.model || ''}` },
        { label: 'Year', key: 'year' },
        { label: 'Mileage', transform: v => v.mileage ? `${Number(v.mileage).toLocaleString()} mi` : '-' },
        { label: 'Status', render: v => <StatusBadge status={v.status} /> },
      ]}
    />
  );
}
*/

// ============================================
// EXAMPLE 2: Modern Form Usage (Create/Edit)
// ============================================
/*
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ModernForm,
  TextInput,
  SelectInput,
  TextAreaInput,
  FileInput,
  FormGrid,
  StatusBadge,
} from '../components/ModernForm';
import { api } from '../services/api';

export default function VehicleForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [formData, setFormData] = useState({
    license_plate: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    status: 'active',
    fuel_type: 'diesel',
    notes: '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (id) {
        await api.updateVehicle(id, formData);
      } else {
        await api.createVehicle(formData);
      }
      navigate('/vehicles');
    } catch (err) {
      setError(err.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModernForm
      title={id ? 'Edit Vehicle' : 'Add New Vehicle'}
      subtitle="Update your fleet information"
      onSubmit={handleSubmit}
      isLoading={loading}
      error={error}
      isEditing={!!id}
      backUrl="/vehicles"
    >
      <FormGrid columns={2}>
        <TextInput
          label="License Plate"
          placeholder="GHS-0001"
          value={formData.license_plate}
          onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
          required
        />
        <SelectInput
          label="Status"
          value={formData.status}
          onChange={(e) => setFormData({...formData, status: e.target.value})}
          options={[
            { value: 'active', label: 'Active' },
            { value: 'maintenance', label: 'Maintenance' },
          ]}
          required
        />
      </FormGrid>

      <FormGrid columns={3}>
        <TextInput
          label="Make"
          placeholder="Toyota"
          value={formData.make}
          onChange={(e) => setFormData({...formData, make: e.target.value})}
          required
        />
        <TextInput
          label="Model"
          placeholder="Hiace"
          value={formData.model}
          onChange={(e) => setFormData({...formData, model: e.target.value})}
          required
        />
        <TextInput
          label="Year"
          type="number"
          value={formData.year}
          onChange={(e) => setFormData({...formData, year: e.target.value})}
          required
        />
      </FormGrid>

      <FormGrid columns={2}>
        <SelectInput
          label="Fuel Type"
          value={formData.fuel_type}
          onChange={(e) => setFormData({...formData, fuel_type: e.target.value})}
          options={[
            { value: 'diesel', label: 'Diesel' },
            { value: 'petrol', label: 'Petrol' },
            { value: 'electric', label: 'Electric' },
            { value: 'hybrid', label: 'Hybrid' },
          ]}
        />
      </FormGrid>

      <TextAreaInput
        label="Notes"
        placeholder="Add any additional notes about this vehicle..."
        value={formData.notes}
        onChange={(e) => setFormData({...formData, notes: e.target.value})}
        rows={4}
      />
    </ModernForm>
  );
}
*/

// ============================================
// KEY FEATURES OF MODERN CRUD STYLE
// ============================================

/**
 * 1. MODERN LIST PAGE FEATURES:
 *   ✅ Gradient header with icon and description
 *   ✅ Real-time search/filter functionality
 *   ✅ Smooth hover animations on rows
 *   ✅ Item count indicator
 *   ✅ Professional action buttons (View, Edit, Delete)
 *   ✅ Responsive design (mobile & desktop)
 *   ✅ Beautiful empty state with emoji
 *   ✅ Loading animation
 *   ✅ Error handling with dismiss button
 *   ✅ Alternating row colors for better readability
 *   ✅ Floating action buttons
 *   ✅ Table footer with item count
 *   ✅ Refresh button
 */

/**
 * 2. MODERN FORM FEATURES:
 *   ✅ Gradient header with edit indicator
 *   ✅ Beautiful form fields with focus states
 *   ✅ Rounded corners and smooth shadows
 *   ✅ Error handling with visual feedback
 *   ✅ Loading state on submit button
 *   ✅ File upload with preview
 *   ✅ Multiple form field types
 *   ✅ Grid layout for better organization
 *   ✅ Status badges for visual indication
 *   ✅ Sticky footer with action buttons
 *   ✅ Proper spacing and typography
 *   ✅ Professional color scheme
 */

/**
 * 3. COMPONENT USAGE GUIDE:
 *
 * ModernListPage:
 *   - title: String - Main heading
 *   - description: String (optional) - Subtitle
 *   - fetchData: Function - Async function to load data
 *   - deleteItem: Function - Async function to delete item
 *   - createUrl: String - URL for create page
 *   - viewUrl: Function - URL generator for view page
 *   - editUrl: Function - URL generator for edit page
 *   - columns: Array - Column definitions with label, key, transform, or render
 *   - keyField: String - Field to use as unique key (default: 'id')
 *   - icon: Component - React icon component for header
 *
 * ModernForm:
 *   - title: String - Form heading
 *   - subtitle: String (optional) - Form subtitle
 *   - onSubmit: Function - Form submission handler
 *   - isLoading: Boolean - Show loading state
 *   - error: String - Error message to display
 *   - isEditing: Boolean - Show edit indicator
 *   - backUrl: String or Number - URL or -1 for back button
 *
 * Form Fields:
 *   - TextInput: Text field
 *   - SelectInput: Dropdown select
 *   - TextAreaInput: Multi-line text
 *   - FileInput: File upload with preview
 *   - FormGrid: Layout grid for fields
 *   - StatusBadge: Colored status indicator
 */

// ============================================
// COLOR SCHEME & STYLING
// ============================================

/**
 * Primary Colors:
 *   - Blue: #3B82F6 (action buttons, highlights)
 *   - Indigo: #4F46E5 (gradients)
 *   - Cyan: #06B6D4 (accents)
 *
 * Status Colors:
 *   - Active: Green (#22C55E)
 *   - Inactive: Gray (#6B7280)
 *   - Pending: Yellow (#EAB308)
 *   - Completed: Blue (#3B82F6)
 *   - Suspended/Error: Red (#EF4444)
 *   - Maintenance: Orange (#F97316)
 *
 * Spacing:
 *   - Uses Tailwind spacing scale (px-4, py-3, gap-4, etc.)
 *   - Rounded corners: rounded-lg, rounded-xl, rounded-2xl
 *   - Shadows: shadow-md, shadow-lg, shadow-xl
 *
 * Responsive:
 *   - Mobile first design
 *   - md: breakpoint for tablets/small desktops
 *   - Full width on mobile, constrained on desktop (max-w-7xl)
 */

export default {};
