import ManagementTable from './ManagementTable';

export default function VolunteersManagement() {
  return (
    <ManagementTable
      title="Volunteer Applications"
      description="Manage volunteer applications and inquiries"
      tableName="volunteer_applications"
      exportFilename="volunteers.csv"
      columns={[
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'areas_of_interest', label: 'Interests', render: (val) => Array.isArray(val) ? val.join(', ') : val || 'N/A' },
        { key: 'availability', label: 'Availability' },
        { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
      ]}
    />
  );
}
