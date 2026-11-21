<template>
  <footer class="rodape">
    <div class="contentor">
      <p>
        Dados:
        <a href="https://open-meteo.com/" target="_blank" rel="noopener">Open-Meteo</a> (previsão, rios GloFAS, altitude) ·
        <a href="https://www.gdacs.org/" target="_blank" rel="noopener">GDACS</a> ·
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">© OpenStreetMap</a> ·
        <a href="https://www.geonames.org/" target="_blank" rel="noopener">GeoNames</a>
      </p>
      <p>
        Não substitui os avisos do
        <a href="https://www.inam.gov.mz/" target="_blank" rel="noopener">INAM</a> e do
        <a href="https://www.ingd.gov.mz/" target="_blank" rel="noopener">INGD</a>.
      </p>
    </div>
  </footer>
</template>

<style scoped>
.rodape {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  padding: 1rem 0 1.5rem;
  text-align: center;
}
.rodape p {
  margin: 0 0 0.35rem;
}
.rodape a {
  color: #fff;
  text-decoration-color: rgba(255, 255, 255, 0.4);
}
</style>
