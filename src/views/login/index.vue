<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  data() {
    return {
      username: '',
      password: '',
    }
  },
  methods: {
    handleSubmit() {
      // 在这里处理登录逻辑，例如向服务器发送请求验证用户身份等。
      console.log(`Username: ${this.username}, Password: ${this.password}`)
    },
  },
})
</script>

<template>
  <div class="login-container">
    <form class="login-form" @submit.prevent="handleSubmit">
      <h2>Login</h2>
      <label for="username">Username:</label>
      <input id="username" v-model="username" type="text" required>
      <label for="password">Password:</label>
      <input id="password" v-model="password" type="password" required>
      <button type="submit">
        Login
      </button>
    </form>
  </div>
</template>

  <style>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  .login-form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    padding: 2rem;
    border: 1px solid #ccc;
    border-radius: 5px;
  }

  h2 {
    margin-top: 0;
  }
  </style>
