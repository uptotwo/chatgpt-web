<script>
import { ref } from 'vue'

export default {
  name: 'LoginPage',
  setup() {
    const username = ref('')
    const password = ref('')

    const login = () => {
      // send login request using username.value and password.value
      console.log(`Logging in with username ${username.value} and password ${password.value}`)
    }

    return {
      username,
      password,
      login,
    }
  },
}
</script>

<template>
  <div class="login-page">
    <form>
      <h1>Login</h1>
      <div>
        <input v-model="username" type="text" placeholder="Username">
      </div>
      <div>
        <input v-model="password" type="password" placeholder="Password">
      </div>
      <div>
        <button type="submit" @click.prevent="login">
          Login
        </button>
      </div>
    </form>
  </div>
</template>

  <style scoped>
  .login-page {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
    padding: 2rem;
    border-radius: 0.5rem;
    box-shadow: 0px 0px 10px rgba(0, 0, 0, 0.1);
  }

  h1 {
    margin: 0;
    text-align: center;
  }
  </style>
