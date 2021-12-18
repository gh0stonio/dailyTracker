import type { NextPage } from 'next'

import styles from './Home.module.css'

const Home: NextPage = () => {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Welcome to Daily Tracker!</h1>
        <p className={styles.description}>Let&apos;s organise your day</p>
      </main>
    </div>
  )
}

export default Home
