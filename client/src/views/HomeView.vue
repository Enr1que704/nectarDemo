<script setup lang="ts">
</script>

<template>
  <div class="home-container">
    <div class="hero-section">
      <h1>Welcome to the Nectar Technical Assessment</h1>
      <p class="subtitle">A full-stack application showcasing modern web development practices</p>
    </div>

    <div class="content-section">
      <div class="tech-stack">
        <h2>Technology Stack</h2>
        <div class="tech-grid">
          <div class="tech-card">
            <h3>Frontend</h3>
            <ul>
              <li>Vue.js 3 with TypeScript</li>
              <li>Vite for build tooling</li>
              <li>Modern CSS with scoped styling</li>
            </ul>
          </div>
          <div class="tech-card">
            <h3>Backend</h3>
            <ul>
              <li>Node.js with Express</li>
              <li>TypeScript for type safety</li>
              <li>Prisma ORM for database operations</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="features-section">
        <h2>Key Features</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <h3>User Management</h3>
            <p>Robust user management system with:</p>
            <ul>
              <li>User creation and filtering</li>
              <li>Country-based user queries</li>
              <li>Duplicate detection algorithms</li>
            </ul>
          </div>
          <div class="feature-card">
            <h3>Weather Integration</h3>
            <p>Real-time weather data integration:</p>
            <ul>
              <li>National Weather Service API integration</li>
              <li>State-based zone lookups</li>
              <li>Multi-zone forecast retrieval</li>
              <li>Result caching for quick lookups</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="implementation-section">
        <h2>Technical Implementation</h2>
        <div class="implementation-grid">
          <div class="implementation-card">
            <h3>Error Handling</h3>
            <ul>
              <li>Comprehensive error catching</li>
              <li>Zod request validation</li>
              <li>Request logging with timestamps</li>
            </ul>
          </div>
          <div class="implementation-card">
            <h3>Type Safety</h3>
            <ul>
              <li>TypeScript throughout the stack</li>
              <li>Prisma-generated types</li>
              <li>Strict type checking</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.hero-section h1 {
  color: #1A2238;  
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.subtitle {
  color: #666;
  font-size: 1.2rem;
}

.content-section {
  display: flex;
  flex-direction: column;
  gap: 3rem;
}

h2 {
  color: #1A2238;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
}

.tech-grid, .feature-grid, .implementation-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 1rem;
}

.tech-card, .feature-card, .implementation-card {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.tech-card:hover, .feature-card:hover, .implementation-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

h3 {
  color: #1A2238;
  font-size: 1.3rem;
  margin-bottom: 1rem;
}

ul {
  list-style-type: none;
  padding-left: 0;
}

li {
  margin-bottom: 0.5rem;
  padding-left: 1.5rem;
  position: relative;
}

li:before {
  content: "•";
  color: #1A2238;
  position: absolute;
  left: 0;
}

p {
  color: #666;
  margin-bottom: 1rem;
}
</style>
