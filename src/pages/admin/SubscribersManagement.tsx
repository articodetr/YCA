import ManagementTable from './ManagementTable';

export default function SubscribersManagement() {
  return (
    <ManagementTable
      title="Newsletter Subscribers"
      description="Manage newsletter subscriptions"
      tableName="newsletter_subscribers"
      exportFilename="subscribers.csv"
      columns={[
        { key: 'email', label: 'Email' },
        {
          key: 'is_active',
          label: 'Status',
          render: (val) => (
            <span
              className={`inline-block px-2 py-1 text-xs font-medium rounded-full ${
                val ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              {val ? 'Active' : 'Inactive'}
            </span>
          ),
        },
        { key: 'created_at', label: 'Subscribed', render: (val) => new Date(val).toLocaleDateString() },
      ]}
    />
  );
}
