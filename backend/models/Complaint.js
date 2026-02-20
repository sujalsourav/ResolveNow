import mongoose from 'mongoose';

const complaintSchema = new mongoose.Schema(
  {
    complaintId: { type: String, unique: true, required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    category: {
      type: String,
      enum: ['product', 'service', 'billing', 'delivery', 'technical', 'other'],
      default: 'other',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['submitted', 'assigned', 'in_progress', 'resolved', 'closed'],
      default: 'submitted',
    },
    address: String,
    contactPhone: String,
    purchaseDate: Date,
    attachments: [{ url: String, name: String }],
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    assignedAt: Date,
    resolution: String,
    resolvedAt: Date,
    closedAt: Date,
    feedback: { rating: Number, comment: String, submittedAt: Date },
    suggestions: [
      {
        from: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        fromRole: String,
        text: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

complaintSchema.index({ user: 1, createdAt: -1 });
complaintSchema.index({ status: 1, assignedTo: 1 });
complaintSchema.index({ complaintId: 1 });

export default mongoose.model('Complaint', complaintSchema);
