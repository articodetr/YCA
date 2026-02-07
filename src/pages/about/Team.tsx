import { Mail, Facebook, Linkedin } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import PageHeader from '../../components/PageHeader';
import { fadeInUp, staggerContainer, staggerItem, scaleIn } from '../../lib/animations';
import { supabase } from '../../lib/supabase';
import { addCacheBuster } from '../../lib/image-cache';

interface TeamMember {
  name: string;
  role: string;
  image: string;
  bio: string;
  updated_at?: string;
  social?: {
    twitter?: string;
    facebook?: string;
    linkedin?: string;
  };
}

export default function Team() {
  const [board, setBoard] = useState<TeamMember[]>([]);
  const [committees, setCommittees] = useState<TeamMember[]>([]);
  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    try {
      console.log('Fetching team members...');
      const { data, error } = await supabase
        .from('team_members')
        .select('*')
        .eq('is_active', true)
        .order('member_type', { ascending: true })
        .order('order_number', { ascending: true });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }

      console.log('Fetched team members:', data);

      const boardMembers = data?.filter(m => m.member_type === 'board').map(m => {
        const imageUrl = m.image_url
          ? addCacheBuster(m.image_url, m.updated_at)
          : 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=400&h=500';

        console.log('Board member:', m.name, 'Image URL:', imageUrl);

        return {
          name: m.name,
          role: m.role,
          image: imageUrl,
          bio: m.bio || '',
          updated_at: m.updated_at,
          social: m.social_media || { twitter: '#', facebook: '#', linkedin: '#' }
        };
      }) || [];

      const committeeMembers = data?.filter(m => m.member_type === 'committee').map(m => ({
        name: m.name,
        role: m.role,
        image: m.image_url
          ? addCacheBuster(m.image_url, m.updated_at)
          : 'https://images.pexels.com/photos/3762800/pexels-photo-3762800.jpeg?auto=compress&cs=tinysrgb&w=400&h=500',
        bio: m.bio || '',
        updated_at: m.updated_at,
        social: m.social_media || { twitter: '#', facebook: '#', linkedin: '#' }
      })) || [];

      const staffMembers = data?.filter(m => m.member_type === 'staff').map(m => ({
        name: m.name,
        role: m.role,
        image: m.image_url
          ? addCacheBuster(m.image_url, m.updated_at)
          : 'https://images.pexels.com/photos/3778603/pexels-photo-3778603.jpeg?auto=compress&cs=tinysrgb&w=400&h=500',
        bio: m.bio || '',
        updated_at: m.updated_at,
        social: m.social_media || { twitter: '#', facebook: '#', linkedin: '#' }
      })) || [];

      setBoard(boardMembers);
      setCommittees(committeeMembers);
      setStaff(staffMembers);

      console.log('Team members loaded:', {
        board: boardMembers.length,
        committees: committeeMembers.length,
        staff: staffMembers.length
      });
    } catch (error) {
      console.error('Error fetching team members:', error);
      setError(error instanceof Error ? error.message : 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  // Custom X icon component
  const XIcon = ({ size = 20 }: { size?: number }) => (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );

  const SocialIcon = ({
    href,
    icon: Icon,
    label,
    bgColor,
    iconColor
  }: {
    href: string;
    icon: any;
    label: string;
    bgColor: string;
    iconColor: string;
  }) => (
    <a
      href={href}
      className={`w-12 h-12 ${bgColor} rounded-full flex items-center justify-center ${iconColor} transition-all duration-200 hover:scale-110 shadow-lg`}
      aria-label={label}
    >
      <Icon size={20} />
    </a>
  );

  const TeamCard = ({
    member,
    colorTheme
  }: {
    member: TeamMember;
    colorTheme: {
      bg: string;
      role: string;
    };
  }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const handleImageError = () => {
      console.error('Failed to load image for:', member.name, member.image);
      setImageError(true);
    };

    const handleImageLoad = () => {
      setImageLoaded(true);
    };

    return (
      <motion.div
        className="rounded-2xl overflow-hidden shadow-lg"
        variants={staggerItem}
        whileHover={{ y: -8, transition: { duration: 0.3 } }}
      >
        <div
          className="relative h-80 overflow-hidden bg-gray-100"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {!imageLoaded && !imageError && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          )}
          <img
            src={member.image}
            alt={member.name}
            className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
            loading="lazy"
            onError={handleImageError}
            onLoad={handleImageLoad}
          />
          {imageError && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">👤</div>
                <p className="text-sm text-gray-600">{member.name}</p>
              </div>
            </div>
          )}

          <motion.div
            className="absolute bottom-0 left-0 right-0 flex items-center justify-center gap-3 pb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{
              opacity: isHovered ? 1 : 0,
              y: isHovered ? 0 : 20
            }}
            transition={{ duration: 0.3 }}
          >
            {member.social?.twitter && (
              <SocialIcon
                href={member.social.twitter}
                icon={XIcon}
                label="X (Twitter)"
                bgColor="bg-white"
                iconColor="text-black"
              />
            )}
            {member.social?.facebook && (
              <SocialIcon
                href={member.social.facebook}
                icon={Facebook}
                label="Facebook"
                bgColor="bg-white"
                iconColor="text-[#1877F2]"
              />
            )}
            {member.social?.linkedin && (
              <SocialIcon
                href={member.social.linkedin}
                icon={Linkedin}
                label="LinkedIn"
                bgColor="bg-white"
                iconColor="text-[#0A66C2]"
              />
            )}
          </motion.div>
        </div>

        <div className={`p-6 ${colorTheme.bg} text-white`}>
          <h3 className="text-xl font-bold mb-1">{member.name}</h3>
          <p className={`${colorTheme.role} font-semibold mb-3`}>{member.role}</p>
          <p className="text-gray-100 text-sm">{member.bio}</p>
        </div>
      </motion.div>
    );
  };

  console.log('Team component render - Loading:', loading, 'Error:', error, 'Board:', board.length, 'Committees:', committees.length, 'Staff:', staff.length);

  if (loading) {
    return (
      <div>
        <PageHeader
          title="Our Team"
          description=""
          breadcrumbs={[{ label: 'About', path: '/about/team' }, { label: 'Team' }]}
          pageKey="about_team"
        />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <PageHeader
          title="Our Team"
          description=""
          breadcrumbs={[{ label: 'About', path: '/about/team' }, { label: 'Team' }]}
          pageKey="about_team"
        />
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 text-lg mb-4">Error loading team members</p>
            <p className="text-gray-600">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchTeamMembers();
              }}
              className="mt-4 px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Our Team"
        description="Meet the People Behind YCA Birmingham"
        breadcrumbs={[{ label: 'About', path: '/about/team' }, { label: 'Team' }]}
        pageKey="about_team"
      />

      <div className="pt-20">
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <motion.div
              className="text-center mb-16"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeInUp}
            >
              <h2 className="text-4xl font-bold text-primary mb-4">YCA Board Members</h2>
              <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
              <p className="text-lg text-muted max-w-3xl mx-auto">
                Our dedicated board members provide strategic guidance and governance to ensure YCA Birmingham achieves its mission and serves the community effectively.
              </p>
            </motion.div>

            <motion.div
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={staggerContainer}
            >
              {board.length > 0 ? (
                board.map((member, index) => (
                  <TeamCard
                    key={index}
                    member={member}
                    colorTheme={{
                      bg: 'bg-slate-800',
                      role: 'text-blue-200'
                    }}
                  />
                ))
              ) : (
                <div className="col-span-full text-center py-12">
                  <p className="text-gray-500 text-lg">No board members found.</p>
                </div>
              )}
            </motion.div>

            <div className="mb-20">
              <motion.div
                className="text-center mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">Sub Committees</h2>
                <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
                <p className="text-lg text-muted max-w-3xl mx-auto">
                  Our committee officers lead specialized programmes and initiatives within the community.
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {committees.length > 0 ? (
                  committees.map((member, index) => (
                    <TeamCard
                      key={index}
                      member={member}
                      colorTheme={{
                        bg: 'bg-teal-700',
                        role: 'text-teal-100'
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No committee members found.</p>
                  </div>
                )}
              </motion.div>
            </div>

            <div>
              <motion.div
                className="text-center mb-12"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeInUp}
              >
                <h2 className="text-4xl font-bold text-primary mb-4">Staff</h2>
                <div className="w-24 h-1 bg-accent mx-auto mb-6"></div>
                <p className="text-lg text-muted max-w-3xl mx-auto">
                  Our professional staff members manage day-to-day operations and deliver essential services to the community.
                </p>
              </motion.div>

              <motion.div
                className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={staggerContainer}
              >
                {staff.length > 0 ? (
                  staff.map((member, index) => (
                    <TeamCard
                      key={index}
                      member={member}
                      colorTheme={{
                        bg: 'bg-amber-700',
                        role: 'text-amber-50'
                      }}
                    />
                  ))
                ) : (
                  <div className="col-span-full text-center py-12">
                    <p className="text-gray-500 text-lg">No staff members found.</p>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-sand">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            className="max-w-3xl mx-auto"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={scaleIn}
          >
            <motion.div
              className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6"
              whileHover={{ scale: 1.1, rotate: 5 }}
            >
              <Mail size={36} className="text-primary" />
            </motion.div>
            <h2 className="text-3xl font-bold text-primary mb-4">Want to Get in Touch?</h2>
            <p className="text-lg text-muted mb-8">
              Our team is here to help. Contact us for any inquiries or to learn more about our work.
            </p>
            <motion.a
              href="mailto:info@yca-birmingham.org.uk"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg hover:bg-secondary transition-colors font-semibold"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Contact the Team
            </motion.a>
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-primary text-white">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeInUp}
        >
          <h2 className="text-3xl font-bold mb-4">Join Our Team</h2>
          <p className="text-xl text-gray-300 mb-6 max-w-3xl mx-auto">
            We're always looking for passionate individuals to volunteer and contribute to our community mission.
          </p>
        </motion.div>
      </section>
      </div>
    </div>
  );
}
