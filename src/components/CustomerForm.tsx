import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { customerSchema, CustomerFormData } from '../schemas/validation';
import { useAppStore } from '../store/appStore';
import { Customer } from '../types';

interface CustomerFormProps {
  customer?: Customer;
  onClose: () => void;
}

export default function CustomerForm({ customer, onClose }: CustomerFormProps) {
  const addCustomer = useAppStore((state) => state.addCustomer);
  const updateCustomer = useAppStore((state) => state.updateCustomer);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormData>({
    resolver: zodResolver(customerSchema),
    defaultValues: customer
      ? {
          name: customer.name,
          email: customer.email || '',
          phone: customer.phone || '',
          creditLimit: customer.creditLimit,
          notes: customer.notes || '',
        }
      : undefined,
  });

  const onSubmit = (data: CustomerFormData) => {
    if (customer) {
      updateCustomer(customer.id, data);
    } else {
      addCustomer(data);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
      <div 
        className="panel max-w-md w-full animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-bold mb-4">
          {customer ? 'Edit Customer' : 'Add New Customer'}
        </h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="customer-name" className="label">Customer Name *</label>
            <input
              id="customer-name"
              type="text"
              className="input-field"
              placeholder="DK1"
              {...register('name')}
            />
            {errors.name && (
              <p className="text-danger text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="customer-email" className="label">Email</label>
              <input
                id="customer-email"
                type="email"
                className="input-field"
                placeholder="customer@email.com"
                {...register('email')}
              />
              {errors.email && (
                <p className="text-danger text-xs mt-1">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="customer-phone" className="label">Phone</label>
              <input
                id="customer-phone"
                type="tel"
                className="input-field"
                placeholder="+1234567890"
                {...register('phone')}
              />
            </div>
          </div>

          <div>
            <label htmlFor="customer-credit-limit" className="label">Credit Limit</label>
            <input
              id="customer-credit-limit"
              type="number"
              step="0.01"
              className="input-field input-number"
              placeholder="100000"
              {...register('creditLimit', { valueAsNumber: true })}
            />
          </div>

          <div>
            <label htmlFor="customer-notes" className="label">Notes</label>
            <textarea
              id="customer-notes"
              className="input-field"
              rows={3}
              placeholder="Additional notes..."
              {...register('notes')}
            />
          </div>

          <div className="flex gap-3">
            <button type="submit" className="btn btn-add flex-1">
              {customer ? 'Update' : 'Add'} Customer
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

