import ManagementTable from './ManagementTable';

export default function PartnershipsManagement() {
  return (
    <ManagementTable
      title="Partnership Requests"
      description="Manage partnership and collaboration inquiries"
      tableName="partnership_requests"
      exportFilename="partnerships.csv"
      columns={[
        { key: 'organization_name', label: 'Organization' },
        { key: 'contact_person', label: 'Contact Person' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'partnership_type', label: 'Type' },
        { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
      ]}
    />
  );
}
