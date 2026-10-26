// Content the database is seeded with on first run. Everything here is editable from /admin.
export const defaultContent = {
  profile: {
    firstName: 'Yousef',
    lastName: 'Al-Harbi',
    eyebrow: 'DevOps & Cloud Engineer · Riyadh',
    lede:
      "I build cloud platforms that **deploy themselves**, **recover on their own**, and tell you what they're doing. Terraform, Kubernetes, CI/CD and observability on Azure.",
    primaryCta: 'Start a conversation',
    secondaryCta: 'View experience',
    badgeLabel: 'Currently',
    badgeText: 'Cloud Engineer · SRCA',
    badgeLive: true,
  },
  about: {
    statement:
      'I take workloads off __aging servers__ and onto *clouds that scale*, then wire in the pipelines, failover and dashboards that keep them *boringly reliable*.',
    workCaption: 'On site · data center / office / event',
    detailCaption: 'Certificate day / team / setup',
  },
  photos: {
    portrait: null,
    work: null,
    detail: null,
  },
  experience: {
    heading: 'Three roles, one direction.',
    roles: [
      {
        id: 'srca',
        year: '2026',
        title: 'Cloud Engineer',
        org: 'Saudi Red Crescent Authority',
        where: 'Saudi Red Crescent Authority (SRCA) · Riyadh · 04/2026 – present',
        status: 'Running',
        points: [
          'Moved on-premises virtual machines and workloads to the cloud at scale with VMware HCX, keeping downtime minimal and data intact through cutover.',
          'Designed disaster recovery for mission-critical systems, including SQL Server Always On Availability Groups with automated failover.',
          'Run Windows and Linux servers across on-prem and cloud: provisioning, patching, tuning and monitoring.',
        ],
        tags: ['VMware HCX', 'vSphere', 'SQL Always On', 'Disaster Recovery', 'Windows / Linux'],
      },
      {
        id: 'techvisions',
        year: '2026',
        title: 'Cloud & DevOps Engineer',
        org: 'TechVisions',
        where: 'Technology Visions for IT (TechVisions) · Riyadh · 01/2026 – present',
        status: 'Running',
        points: [
          'Build and maintain CI/CD pipelines in GitHub Actions and Azure DevOps that automate build, test and deployment.',
          'Provision infrastructure as code with Terraform so development and production stay identical and version-controlled.',
          'Deploy containerized workloads on Docker and AKS alongside development teams to shorten release cycles.',
          'Instrument systems with Prometheus, Grafana and Azure Monitor, and automate routine operations away.',
        ],
        tags: ['Terraform', 'GitHub Actions', 'Azure DevOps', 'AKS', 'Prometheus', 'Grafana'],
      },
      {
        id: 'ironhack',
        year: '2025',
        title: 'DevOps Engineer Trainee',
        org: 'Ironhack with SDA',
        where: 'Ironhack with SDA · Riyadh · 08/2025 – 12/2025',
        status: 'Completed',
        points: [
          'Intensive hands-on program on Azure infrastructure, automation and CI/CD.',
          'Automated cloud resources with Terraform and built pipelines with GitHub Actions.',
          'Deployed workloads to AKS and monitored them with Prometheus, Grafana and Azure Monitor.',
        ],
        tags: ['Azure', 'Terraform', 'GitHub Actions', 'Kubernetes'],
      },
    ],
  },
  stack: {
    heading: 'Declared, not described.',
    note: "Everything I work with, written the way I'd write it on the job.",
    fileName: 'yousef.tf',
    barRight: 'terraform plan · 0 to destroy',
    moduleName: 'yousef_alharbi',
    scalars: [
      { key: 'role', value: 'DevOps & Cloud Engineer' },
      { key: 'location', value: 'Riyadh, SA' },
    ],
    groups: [
      { key: 'cloud', values: ['Azure AKS', 'ACR', 'App Service', 'Key Vault'] },
      { key: 'iac', values: ['Terraform', 'ARM Templates'] },
      { key: 'ci_cd', values: ['GitHub Actions', 'Azure DevOps'] },
      { key: 'containers', values: ['Docker', 'Kubernetes'] },
      { key: 'observability', values: ['Prometheus', 'Grafana', 'Azure Monitor', 'Log Analytics'] },
      { key: 'network', values: ['VNet', 'Private Endpoints', 'RBAC', 'TLS'] },
      { key: 'migration_dr', values: ['VMware HCX', 'vSphere', 'SQL Always On AG'] },
      { key: 'languages', values: ['Python', 'JavaScript', 'SQL'] },
    ],
    comment: 'Windows & Linux server administration included',
  },
  certifications: {
    heading: 'Certified on four platforms.',
    items: [
      { issuer: 'AWS', name: 'Solutions Architect – Associate' },
      { issuer: 'Google', name: 'Associate Cloud Engineer' },
      { issuer: 'Oracle', name: 'OCI Certified Architect Associate' },
      { issuer: 'Oracle', name: 'OCI 2025 Certified Foundations Associate' },
      { issuer: 'DASA', name: 'DevOps Fundamentals' },
    ],
  },
  education: {
    items: [
      {
        degree: 'BSc Computer Science',
        school: 'Taibah University',
        details:
          'Medina, 2020 – 2025. Software development, data analysis and web technologies, with an IT internship and a full-stack capstone project.',
      },
    ],
  },
  contact: {
    headline: 'Need infrastructure that',
    headlineAccent: 'stays up?',
    email: 'yousef.Alharbi.h7@gmail.com',
    phone: '+966 580 104 611',
    location: 'Riyadh, Saudi Arabia',
    links: [],
  },
  seo: {
    title: 'Yousef Al-Harbi · DevOps & Cloud Engineer',
    description:
      'Yousef Al-Harbi, DevOps and Cloud Engineer in Riyadh. Terraform, Kubernetes, CI/CD, observability, cloud migration and disaster recovery.',
  },
};
