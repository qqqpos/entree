<template>
    <div>
        Loading
    </div>
</template>

<script>
export default {};
</script>

<style scoped>
div {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(
    ellipse at center,
    #85d7ea 7%,
    #6bcbe1 63%,
    #5bb8dc 100%
  );
  overflow: hidden;
  z-index: 2;
  display: flex;
  justify-content: center;
  align-items: center;
  font-family: "Yuanti-SC";
  font-size: 40px;
  color: #fff;
  font-weight: bold;
  text-shadow: 0 1px 3px #333;
}
</style>