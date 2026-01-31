import ManagementTable from './ManagementTable';

export default function ContactsManagement() {
  return (
    <ManagementTable
      title="Contact Messages"
      description="Manage contact form submissions and inquiries"
      tableName="contact_submissions"
      exportFilename="contacts.csv"
      columns={[
        { key: 'full_name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'phone', label: 'Phone' },
        { key: 'subject', label: 'Subject' },
        { key: 'message', label: 'Message', render: (val) => val?.substring(0, 50) + '...' || 'N/A' },
        { key: 'created_at', label: 'Date', render: (val) => new Date(val).toLocaleDateString() },
      ]}
    />
  );
}
