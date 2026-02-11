import { Heart, Users, BookOpen, Calendar, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import PageHeader from '../../components/PageHeader';

export default function WomenProgramme() {
  return (
    <div>
      <PageHeader
        title="Women's Programme"
        description=""
        breadcrumbs={[{ label: 'Programmes', path: '/programmes/women' }, { label: 'Women' }]}
        pageKey="programmes_women"
      />

      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="bg-sand p-8 rounded-lg mb-12">
              <p className="text-lg text-muted leading-relaxed mb-4">
                At YCA Birmingham, we believe that when women thrive, the entire community flourishes. Our Women's Programme is a dedicated space designed by women, for women, to provide support, education, and a much-needed place to connect.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-primary mb-6">Sundays are for Connection</h2>
              <p className="text-lg text-muted leading-relaxed mb-6">
                Our Women's Committee organizes a vibrant monthly session on Sunday, creating a consistent "home away from home" for women of all ages. Whether you are looking for professional advice, health tips, or just a friendly chat over tea, there is a place for you here.
              </p>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-primary mb-8">Our Three Core Pillars</h2>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="bg-sand p-6 rounded-lg">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                    <Users size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">Individual Support</h3>
                  <p className="text-muted">
                    Providing the tools and resources women need to navigate life in the UK.
                  </p>
                </div>
                <div className="bg-sand p-6 rounded-lg">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                    <Heart size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">Social Bonds</h3>
                  <p className="text-muted">
                    Fighting isolation by fostering deep, lasting friendships through shared experiences and cultural celebrations.
                  </p>
                </div>
                <div className="bg-sand p-6 rounded-lg">
                  <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mb-4">
                    <BookOpen size={28} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-3">Awareness & Advocacy</h3>
                  <p className="text-muted">
                    Keeping our community informed on vital issues, ensuring women have a voice in both local and national conversations.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-12">
              <h2 className="text-3xl font-bold text-primary mb-6">What We Focus On</h2>
              <p className="text-lg text-muted mb-6 leading-relaxed">
                Each monthly session is unique. We invite experts, educators, and community leaders to lead discussions on topics that matter to you:
              </p>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="border-l-4 border-accent pl-6 py-4">
                  <h4 className="font-bold text-xl text-primary mb-2">Supporting Your Child's Education</h4>
                  <p className="text-muted">
                    Workshops on navigating the UK school system, helping with homework, and engaging with teachers.
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-6 py-4">
                  <h4 className="font-bold text-xl text-primary mb-2">Women's Health & Wellbeing</h4>
                  <p className="text-muted">
                    Dedicated sessions on mental health, preventative care, and navigating the NHS.
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-6 py-4">
                  <h4 className="font-bold text-xl text-primary mb-2">Nutrition & Healthy Lifestyle</h4>
                  <p className="text-muted">
                    Cooking demonstrations, fitness tips, and holistic wellness for the whole family.
                  </p>
                </div>
                <div className="border-l-4 border-accent pl-6 py-4">
                  <h4 className="font-bold text-xl text-primary mb-2">Cultural Heritage</h4>
                  <p className="text-muted">
                    Celebrating our Yemeni roots through traditional events, storytelling, and community festivals.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-gray-100 p-8 rounded-lg mb-12 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="text-6xl text-primary">"</div>
                <div>
                  <p className="text-xl text-primary italic mb-4">
                    The YCA Women's group isn't just a meeting; it's where I found my confidence and my community.
                  </p>
                  <p className="text-secondary font-semibold">– YCA Member</p>
                </div>
              </div>
            </div>

            <div className="bg-primary text-white p-10 rounded-lg">
              <div className="text-center">
                <div className="w-20 h-20 bg-accent rounded-full flex items-center justify-center mx-auto mb-6">
                  <Calendar size={36} className="text-primary" />
                </div>
                <h2 className="text-3xl font-bold mb-6">How to Join Us</h2>
                <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto leading-relaxed">
                  Our sessions are open to all women in the community. We pride ourselves on being an inclusive, safe, and confidential space.
                </p>
                <div className="space-y-4 text-lg mb-8">
                  <p><strong>When:</strong> One Sunday per month</p>
                  <p><strong>Where:</strong> The Muath Trust, Stratford Road, B11 1AR</p>
                  <p><strong>Cost:</strong> Usually free or a nominal fee for materials/refreshments</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    to="/events"
                    className="inline-flex items-center justify-center gap-2 bg-accent text-primary px-8 py-4 rounded-lg hover:bg-hover transition-colors font-semibold"
                  >
                    <Calendar size={20} />
                    Check Next Session
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 bg-transparent border-2 border-white text-white px-8 py-4 rounded-lg hover:bg-white hover:text-primary transition-colors font-semibold"
                  >
                    <Mail size={20} />
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
