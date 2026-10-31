import React from 'react'
import styles from './spinner.module.scss'

const LoadingSpinner = () => {
  return (
    <div>
        <div className={styles.pl}>
            <div className={styles['pl__dot']}>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
            </div>
            <div className={styles['pl__dot']}>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
            </div>
            <div className={styles['pl__dot']}>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
            </div>
            <div className={styles['pl__dot']}>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
            </div>
            <div className={styles['pl__dot']}>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
            </div>
            <div className={styles['pl__dot']}>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
                <div className={styles['pl__dot-layer']}></div>
            </div>
        </div>
    </div>
  )
}

export default LoadingSpinner;
