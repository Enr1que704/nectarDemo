<script setup lang="ts">
// No setup needed for simple welcome message
// put resume in here if you want

</script>

<template>
  <div class="greetings">
    <h1>About Me</h1>
  </div>
  <div class="pdf-container">
    <embed src="/Eric Johnson - Resume.pdf" 
     type="application/pdf" class="pdf-viewer">
  </div>
</template>
  
<style scoped>
.greetings {
  text-align: center;
  margin-top: 20px;
  color: #1A2238;  /* Nectar Navy */
}

.pdf-container {
  display: flex;
  justify-content: center;
  margin: 2rem auto;
  padding: 1rem;
  width: 80%;
}

.pdf-viewer {
  width: 100%;
  height: 80vh;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.pdf-viewer:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(0, 0, 0, 0.15);
}
</style>
