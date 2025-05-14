<template>
  <div class="pagos">
    <h2>Pagos</h2>

    <section class="pago-section">
      <h3>Pago Pendiente</h3>
    </section>

    <section class="pago-section">
      <h3>Pago por Liberar</h3>
      <div class="pago-card">
        <p><strong>Evento:</strong> Rock Night Fest</p>
        <p><strong>Monto Acordado:</strong> S/. 2,500</p>
        <p><strong>Estado:</strong> Por liberar</p>
        <p><strong>Última actualización:</strong> 18/11/2025</p>
      </div>
    </section>

    <section class="pago-section">
      <h3>Pago Realizado</h3>
    </section>
  </div>
</template>

<style scoped>
.pagos {
  padding: 24px;
}
h2 {
  font-size: 24px;
  margin-bottom: 20px;
}
.pago-section {
  margin-bottom: 30px;
}
.pago-card {
  background-color: white;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
</style>
<script setup lang="ts">

</script>