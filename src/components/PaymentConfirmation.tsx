import { useState } from 'react';
import { X, Upload, CheckCircle, CreditCard } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Program = {
  id: string;
  name: string;
  price: number;
  offer_price: number | null;
};

type Props = {
  program: Program;
  onClose: () => void;
};

export default function PaymentConfirmation({ program, onClose }: Props) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    paymentMethod: 'instapay' as 'instapay' | 'vodafone_cash' | 'bank_transfer',
  });
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      setProofFile(file);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.email || !proofFile) {
      setError('Please fill all fields and upload payment proof');
      return;
    }

    setUploading(true);

    try {
      const fileExt = proofFile.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `payment-proofs/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('program-files')
        .upload(filePath, proofFile);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('program-files')
        .getPublicUrl(filePath);

      const { error: insertError } = await supabase.from('program_purchases').insert({
        program_id: program.id,
        customer_name: formData.name,
        customer_email: formData.email,
        payment_method: formData.paymentMethod,
        payment_proof_url: urlData.publicUrl,
        status: 'pending',
      });

      if (insertError) throw insertError;

      setSubmitted(true);
    } catch (err: any) {
      console.error('Error submitting payment:', err);
      setError(err.message || 'Failed to submit payment confirmation');
    } finally {
      setUploading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
        <div className="bg-gray-800 rounded-xl p-8 max-w-md w-full text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Payment Submitted!</h2>
          <p className="text-gray-300 mb-6">
            Your payment confirmation has been submitted successfully. Our admin team will review
            and approve your payment shortly. You will receive an email once approved.
          </p>
          <button
            onClick={onClose}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gray-800 rounded-xl p-6 max-w-2xl w-full my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Confirm Payment</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="bg-gray-900 p-4 rounded-lg mb-6">
          <h3 className="font-semibold mb-2">{program.name}</h3>
          <p className="text-2xl font-bold text-red-500">
            {program.offer_price || program.price} EGP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  paymentMethod: e.target.value as 'instapay' | 'vodafone_cash' | 'bank_transfer',
                })
              }
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-500"
            >
              <option value="instapay">InstaPay</option>
              <option value="vodafone_cash">Vodafone Cash</option>
              <option value="bank_transfer">Bank Transfer</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Payment Proof (Screenshot)
            </label>
            <div className="border-2 border-dashed border-gray-700 rounded-lg p-6 text-center hover:border-red-500 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                id="proof-upload"
              />
              <label htmlFor="proof-upload" className="cursor-pointer">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                {proofFile ? (
                  <p className="text-green-500">{proofFile.name}</p>
                ) : (
                  <p className="text-gray-400">Click to upload payment screenshot</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Max size: 5MB</p>
              </label>
            </div>
          </div>

          <div className="bg-blue-900/30 border border-blue-500 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <CreditCard className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-semibold text-blue-300 mb-2">Payment Instructions:</p>
                <ol className="text-gray-300 space-y-1 list-decimal list-inside">
                  <li>Transfer the amount using your chosen payment method</li>
                  <li>Take a screenshot of the successful transaction</li>
                  <li>Upload the screenshot and submit this form</li>
                  <li>Wait for admin approval (usually within 24 hours)</li>
                  <li>You will receive an email with the program file once approved</li>
                </ol>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/30 border border-red-500 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'Submitting...' : 'Submit Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
