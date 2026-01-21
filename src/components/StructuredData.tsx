// components/StructuredData.tsx
export default function StructuredData() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "আলো স্কিল",
    description: "Online learning platform in Bangla",
    url: "https://aloskill.com",
    logo: "https://aloskill.com/logo.png",
    sameAs: [
      "https://facebook.com/aloskill",
      "https://twitter.com/aloskill",
      "https://instagram.com/aloskill",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+880-1234-567890",
      contactType: "Customer Service",
      availableLanguage: ["Bengali", "English"],
    },
  };

  return (
    <script
      type='application/ld+json'
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}
