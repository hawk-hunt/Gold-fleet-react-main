import React from 'react';
import Header from '../components/Header';

const AboutPage = () => {
  const teamMembers = [
    {
      id: 'ceo',
      name: 'John Smith',
      role: 'Chief Executive Officer',
      image: '/images/team-placeholder.jpg',
      bio: 'John leads Gold Fleet with a vision to revolutionize fleet management through cutting-edge technology and customer-focused solutions.',
    },
    {
      id: 'cto',
      name: 'Sarah Johnson',
      role: 'Chief Technology Officer',
      image: '/images/team-placeholder.jpg',
      bio: 'Sarah oversees all technical development and innovation, bringing 15+ years of experience in transportation solutions.',
    },
    {
      id: 'coo',
      name: 'Michael Chen',
      role: 'Chief Operating Officer',
      image: '/images/team-placeholder.jpg',
      bio: 'Michael ensures operational excellence across the business, optimizing processes to deliver superior customer service.',
    },
    {
      id: 'cfo',
      name: 'Emily Rodriguez',
      role: 'Chief Financial Officer',
      image: '/images/team-placeholder.jpg',
      bio: 'Emily manages financial strategy and planning, ensuring sustainable growth and profitability.',
    },
  ];

  const awards = [
    { year: '2024', title: 'Best Fleet Management Solution', organization: 'Tech Innovation Awards' },
    { year: '2024', title: 'Customer Excellence Award', organization: 'Industry Leaders' },
    { year: '2023', title: 'Most Innovative Company', organization: 'Global Business Review' },
    { year: '2023', title: 'Best Customer Service', organization: 'Fleet Operators Association' },
    { year: '2022', title: 'Technology Excellence', organization: 'Digital Transformation Summit' },
    { year: '2022', title: 'Sustainability Leader', organization: 'Green Logistics Council' },
  ];

  const offices = {
    'West Africa': [
      { city: 'Lagos', address: 'Plot 1234, Victoria Island Business Park, Lagos, Nigeria' },
      { city: 'Accra', address: 'Tower C, Meridian Plaza, Osu, Accra, Ghana' },
      { city: 'Abidjan', address: 'Avenue Terrasson de Fougères, Plateau, Abidjan, Côte d\'Ivoire' },
    ],
    'East Africa': [
      { city: 'Nairobi', address: 'Upper Hill Business District, Nairobi, Kenya' },
      { city: 'Dar es Salaam', address: 'Samora Avenue Corporate Center, Dar es Salaam, Tanzania' },
      { city: 'Kampala', address: 'Nakasero Business Park, Kampala, Uganda' },
    ],
    'Southern Africa': [
      { city: 'Johannesburg', address: '1 Sandton Drive, Sandton, Johannesburg, South Africa' },
      { city: 'Cape Town', address: 'Victoria & Alfred Waterfront Office Park, Cape Town, South Africa' },
    ],
    'North Africa': [
      { city: 'Cairo', address: 'New Cairo Business District, Cairo, Egypt' },
      { city: 'Casablanca', address: 'Boulevard de la Corniche, Casablanca, Morocco' },
    ],
  };

  const FuelIcon = () => (
    <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/>
    </svg>
  );

  const ProductivityIcon = () => (
    <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
    </svg>
  );

  const SafetyIcon = () => (
    <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 11l-4-4 1.41-1.41L10 9.17l6.59-6.59L18 4l-8 8z"/>
    </svg>
  );

  const benefits = [
    { id: 'fuel', icon: <FuelIcon />, title: 'Reduced fuel use', description: 'Decreased vehicle idling by 13%' },
    { id: 'productivity', icon: <ProductivityIcon />, title: 'Increased productivity', description: 'Performed 2.5 more stops per vehicle per week' },
    { id: 'safety', icon: <SafetyIcon />, title: 'Safer driving', description: 'Decreased harsh driving events by 15%' },
  ];

  return (
    <div className="w-full">
      <Header sidebarOpen={false} setSidebarOpen={() => {}} />

      {/* Hero Section */}
      <header className="bg-amber-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h1 className="text-4xl font-bold">About Gold Fleet</h1>
        </div>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center space-x-2 text-sm">
            <a href="/" className="text-amber-600 hover:text-amber-700">Home</a>
            <span className="text-gray-400">/</span>
            <span className="text-gray-600">About us</span>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Guiding a connected world on the go by automating, optimizing and revolutionizing the way people, vehicles and things move through the world.
            </h2>
          </div>
        </div>
      </section>

      {/* Awards Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-12">Awards and recognition</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {awards.map((award, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 text-center">
                <div className="h-24 flex items-center justify-center mb-4">
                  <svg className="w-12 h-12 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">{award.title}</h4>
                <p className="text-sm text-gray-600">{award.organization} - {award.year}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Meet our team</h2>
          <p className="text-lg text-gray-700 mb-12 max-w-3xl">
            Our full suite of industry-defining solutions and services put innovation, automation and connected data to work for customers and help them be safer, more efficient and more productive. With more than 3,500 dedicated employees in 18 countries, we deliver leading mobile technology platforms and solutions.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {teamMembers.map((member) => (
              <div key={member.id} className="bg-white rounded-lg overflow-hidden shadow-lg border border-gray-200 hover:shadow-xl transition-shadow">
                <div className="aspect-square bg-gradient-to-br from-amber-100 to-yellow-100 flex items-center justify-center overflow-hidden">
                  <svg className="w-20 h-20 text-amber-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 12a4 4 0 110-8 4 4 0 010 8zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                  <p className="text-sm text-amber-600 font-medium mb-2">{member.role}</p>
                  <p className="text-sm text-gray-600">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-gradient-to-br from-yellow-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Our customers realized significant benefits
              </h2>
              <p className="text-lg text-gray-700 mb-8">
                Fleet organizations using Gold Fleet solutions experience measurable improvements in efficiency, safety, and profitability.
              </p>
              <div className="space-y-4">
                <a href="/roi-calculator" className="inline-block px-6 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors">
                  Get Your ROI
                </a>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.id} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-shadow">
                  <div className="mb-4">{benefit.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                  <p className="text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Offices Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-12">Our offices around the world</h2>

          {Object.entries(offices).map((region, regionIdx) => (
            <div key={regionIdx} className="mb-16">
              <h3 className="text-2xl font-bold text-gray-900 mb-8">{region[0]}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {region[1].map((office, idx) => (
                  <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200 hover:shadow-lg transition-shadow">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">{office.city}</h4>
                    <p className="text-gray-600 text-sm leading-relaxed">{office.address}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to optimize your fleet?</h2>
          <p className="text-lg text-gray-300 mb-8">Join the list of companies already using Gold Fleet</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="/login?tab=signup" className="px-8 py-3 bg-amber-600 text-white rounded-lg font-semibold hover:bg-amber-700 transition-colors">
              Sign up
            </a>
            <a href="#" className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors">
              Book Demo
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-gray-400">&copy; 2024 Gold Fleet. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default AboutPage;
