import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaTruck } from 'react-icons/fa';
import { api } from '../services/api';
import { useFormValidation } from '../hooks/useFormValidation';
import { compressImage } from '../utils/imageCompression';
import { ModernFormLayout, ModernTextInput, ModernSelectInput, ModernFileInput, FormFieldGroup } from '../components/ModernFormLayout';
import { getAllMakes, getModelsByMake } from '../data/vehicleMakesModels';

export default function VehicleForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(!!id);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  
  const form = useFormValidation(
    {
      name: '',
      license_plate: '',
      type: 'Car',
      make: '',
      model: '',
      year: new Date().getFullYear(),
      vin: '',
      status: 'active',
      fuel_capacity: '',
      fuel_type: 'gasoline',
      notes: '',
    },
    {
      name: {
        required: 'Vehicle name is required',
      },
      license_plate: {
        required: 'License plate is required',
      },
      type: {
        required: 'Vehicle type is required',
      },
      make: {
        required: 'Make is required',
      },
      model: {
        required: 'Model is required',
      },
    }
  );

  useEffect(() => {
    if (id) {
      loadVehicle();
    }
  }, [id]);

  const loadVehicle = async () => {
    try {
      const data = await api.getVehicle(id);
      const vehicle = data.data || data;
      Object.keys(vehicle).forEach((key) => {
        if (form.values.hasOwnProperty(key)) {
          form.setFieldValue(key, vehicle[key] ?? '');
        }
      });
      if (vehicle.image_url) {
        setPreview(vehicle.image_url);
      }
      setLoading(false);
    } catch (err) {
      setError('Failed to load vehicle: ' + err.message);
      setLoading(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('[VehicleForm] Image selected:', file.name, file.type);
      try {
        const { file: compressedFile, preview } = await compressImage(file);
        setImageFile(compressedFile);
        setPreview(preview);
        console.log('[VehicleForm] Image compressed and preview set');
      } catch (err) {
        console.error('[VehicleForm] Image compression error:', err);
        setError('Failed to process image: ' + err.message);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    if (!form.isValid) {
      form.setAllTouched();
      return;
    }

    // Check image for new vehicles
    if (!id && !imageFile) {
      setError('Vehicle image is required');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const formData = new FormData();
      Object.keys(form.values).forEach((key) => {
        formData.append(key, form.values[key]);
      });

      if (imageFile) {
        formData.append('image', imageFile);
      }

      if (id) {
        formData.append('_method', 'PUT');
        await api.updateVehicle(id, formData);
      } else {
        await api.createVehicle(formData);
      }

      navigate('/vehicles');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to save vehicle');
    } finally {
      setLoading(false);
    }
  };

  if (loading && id) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const leftBlock = (
    <FormFieldGroup>
      <ModernTextInput
        label="Vehicle Name"
        name="name"
        type="text"
        value={form.values.name ?? ''}
        onChange={form.handleChange}
        placeholder="e.g., Work Truck 01"
        required
      />
      <ModernTextInput
        label="License Plate"
        name="license_plate"
        type="text"
        value={form.values.license_plate ?? ''}
        onChange={form.handleChange}
        placeholder="ABC-1234"
        required
      />
      <ModernSelectInput
        label="Type"
        name="type"
        value={form.values.type ?? 'Car'}
        onChange={form.handleChange}
        options={[
          { value: 'Car', label: 'Car' },
          { value: 'Bus', label: 'Bus' },
          { value: 'Truck', label: 'Truck' },
          { value: 'Van', label: 'Van' }
        ]}
        required
      />
      <ModernSelectInput
        label="Make"
        name="make"
        value={form.values.make ?? ''}
        onChange={form.handleChange}
        options={getAllMakes().map(make => ({ value: make, label: make }))}
        required
      />
      <ModernSelectInput
        label="Model"
        name="model"
        value={form.values.model ?? ''}
        onChange={form.handleChange}
        options={getModelsByMake(form.values.make).map(model => ({ value: model, label: model }))}
        required
      />
      <ModernTextInput
        label="Year"
        name="year"
        type="number"
        value={form.values.year ?? new Date().getFullYear()}
        onChange={form.handleChange}
      />
    </FormFieldGroup>
  );

  const rightBlock = (
    <FormFieldGroup>
      <ModernFileInput
        label="Vehicle Image"
        onChange={handleImageChange}
        preview={preview}
        helperText="Any image format (PNG, JPG, GIF, WebP, SVG, BMP, etc.) up to 50MB"
      />
      <ModernTextInput
        label="VIN"
        name="vin"
        type="text"
        value={form.values.vin ?? ''}
        onChange={form.handleChange}
        placeholder="VIN123456789"
      />
      <ModernSelectInput
        label="Fuel Type"
        name="fuel_type"
        value={form.values.fuel_type ?? 'gasoline'}
        onChange={form.handleChange}
        options={[
          { value: 'diesel', label: 'Diesel' },
          { value: 'gasoline', label: 'Gasoline' },
          { value: 'electric', label: 'Electric' },
          { value: 'hybrid', label: 'Hybrid' }
        ]}
      />
      <ModernTextInput
        label="Fuel Capacity (gallons)"
        name="fuel_capacity"
        type="number"
        value={form.values.fuel_capacity ?? ''}
        onChange={form.handleChange}
        placeholder="15.5"
        step="0.1"
      />
      <ModernSelectInput
        label="Status"
        name="status"
        value={form.values.status ?? 'active'}
        onChange={form.handleChange}
        options={[
          { value: 'active', label: 'Active' },
          { value: 'maintenance', label: 'Maintenance' },
          { value: 'inactive', label: 'Inactive' }
        ]}
      />
      <ModernTextInput
        label="Notes"
        name="notes"
        type="textarea"
        value={form.values.notes ?? ''}
        onChange={form.handleChange}
        placeholder="Additional notes about the vehicle..."
      />
    </FormFieldGroup>
  );

  return (
    <ModernFormLayout
      title={id ? 'Edit Vehicle' : 'Add New Vehicle'}
      subtitle="Manage vehicle information and specifications"
      icon={FaTruck}
      isEditing={!!id}
      isLoading={loading}
      error={error}
      onSubmit={handleSubmit}
      backUrl="/vehicles"
      leftBlock={leftBlock}
      rightBlock={rightBlock}
    />
  );
}
