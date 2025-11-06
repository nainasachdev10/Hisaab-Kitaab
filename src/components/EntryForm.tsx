import { useState, useMemo } from 'react';
import { useAppStore } from '../store/appStore';
import { formatNumber } from '../utils/calculations';
import { useAlert } from '../contexts/AlertContext';
import { HiOutlineXMark } from 'react-icons/hi2';

interface EntryFormProps {
  teamAName: string;
  teamBName: string;
  matchId: string;
  onClose: () => void;
}

export default function EntryForm({
  teamAName,
  teamBName,
  matchId,
  onClose,
}: EntryFormProps) {
  const addCustomer = useAppStore((state) => state.addCustomer);
  const addLedgerEntry = useAppStore((state) => state.addLedgerEntry);
  const customers = useAppStore((state) => state.customers);
  const { showAlert } = useAlert();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [newCustomerName, setNewCustomerName] = useState('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [exposureA, setExposureA] = useState(0);
  const [exposureB, setExposureB] = useState(0);
  const [sharePercent, setSharePercent] = useState(0);
  const [notes, setNotes] = useState('');

  const share = sharePercent / 100;
  const shareA = exposureA * share;
  const shareB = exposureB * share;

  const selectedCustomer = useMemo(() => {
    return customers.find((c) => c.id === selectedCustomerId);
  }, [selectedCustomerId, customers]);

  const handleSubmit = () => {
    let customerId = selectedCustomerId;

    // Handle new customer creation
    if (isCreatingNew) {
      if (!newCustomerName.trim()) {
        showAlert('warning', 'Validation Error', 'Please enter customer name');
        return;
      }
      
      // Check if customer already exists
      const existingCustomer = customers.find(
        (c) => c.name.toLowerCase() === newCustomerName.trim().toLowerCase()
      );
      
      if (existingCustomer) {
        showAlert('warning', 'Customer Exists', `Customer "${existingCustomer.name}" already exists. Please select from the dropdown.`);
        return;
      }

      // Create new customer - Zustand updates are synchronous
      addCustomer({
        name: newCustomerName.trim(),
        notes: notes.trim() || undefined,
      });
      
      // Get the newly created customer from the updated state
      const updatedCustomers = useAppStore.getState().customers;
      const newCustomer = updatedCustomers.find(
        (c) => c.name.toLowerCase() === newCustomerName.trim().toLowerCase()
      );
      
      if (!newCustomer) {
        showAlert('error', 'Error', 'Failed to create customer. Please try again.');
        return;
      }
      
      customerId = newCustomer.id;
    } else {
      if (!customerId) {
        showAlert('warning', 'Validation Error', 'Please select a customer');
        return;
      }
    }

    // Get customer from current state
    const currentCustomers = useAppStore.getState().customers;
    const customer = currentCustomers.find((c) => c.id === customerId);
    if (!customer) {
      showAlert('error', 'Error', 'Customer not found');
      return;
    }

    // Add ledger entry
    addLedgerEntry({
      customerId: customer.id,
      name: customer.name,
      exposureA,
      exposureB,
      sharePercent,
      matchId,
    });

    // Reset and close
    setSelectedCustomerId('');
    setNewCustomerName('');
    setIsCreatingNew(false);
    setExposureA(0);
    setExposureB(0);
    setSharePercent(0);
    setNotes('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 modal-overlay" onClick={onClose}>
      <div 
        className="panel max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">Add New Entry</h2>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-sm px-2"
            title="Close"
          >
            <HiOutlineXMark className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="entry-customer" className="label">Player / Customer *</label>
            <div className="flex gap-2">
              <select
                id="entry-customer"
                className="input-field flex-1"
                value={isCreatingNew ? '' : selectedCustomerId}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setIsCreatingNew(true);
                  } else {
                    setIsCreatingNew(false);
                    setSelectedCustomerId(e.target.value);
                  }
                }}
                disabled={isCreatingNew}
              >
                <option value="">Select customer...</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
                <option value="__new__">➕ Create New Customer</option>
              </select>
            </div>
            
            {isCreatingNew && (
              <div className="mt-2">
                <label htmlFor="entry-new-customer-name" className="label">New Customer Name</label>
                <input
                  id="entry-new-customer-name"
                  type="text"
                  className="input-field"
                  placeholder="Enter new customer name"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  autoFocus
                />
              </div>
            )}
            
            {selectedCustomer && (
              <div className="mt-2 text-xs opacity-75">
                {selectedCustomer.email && <div>📧 {selectedCustomer.email}</div>}
                {selectedCustomer.phone && <div>📞 {selectedCustomer.phone}</div>}
                {selectedCustomer.notes && <div>📝 {selectedCustomer.notes}</div>}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="entry-exposure-a" className="label">{teamAName} Exposure (±) *</label>
              <input
                id="entry-exposure-a"
                type="number"
                step="1"
                className="input-field input-number"
                placeholder="-9500"
                value={exposureA || ''}
                onChange={(e) => setExposureA(parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <label htmlFor="entry-exposure-b" className="label">{teamBName} Exposure (±) *</label>
              <input
                id="entry-exposure-b"
                type="number"
                step="1"
                className="input-field input-number"
                placeholder="10000"
                value={exposureB || ''}
                onChange={(e) => setExposureB(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <label htmlFor="entry-share-percent" className="label">My Share % *</label>
            <input
              id="entry-share-percent"
              type="number"
              step="0.01"
              className="input-field input-number"
              placeholder="20"
              value={sharePercent || ''}
              onChange={(e) => setSharePercent(parseFloat(e.target.value) || 0)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-[#2a2a2a] rounded-lg border border-line">
            <div>
              <div className="label text-muted">My Share on {teamAName}</div>
              <div className={`text-2xl font-bold font-mono ${shareA < 0 ? 'text-red-400' : 'text-green-500'}`}>
                {formatNumber(shareA)}
              </div>
            </div>
            <div>
              <div className="label text-muted">My Share on {teamBName}</div>
              <div className={`text-2xl font-bold font-mono ${shareB < 0 ? 'text-red-400' : 'text-green-500'}`}>
                {formatNumber(shareB)}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="entry-notes" className="label">Additional Notes</label>
            <textarea
              id="entry-notes"
              className="input-field"
              rows={3}
              placeholder="Additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSubmit}
              className="btn btn-add flex-1"
            >
              Add Entry
            </button>
            <button
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
