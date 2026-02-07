import { lessons as mongoLessons } from './lessons'
import { kafkaLessons } from './kafka-lessons'

export const courses = [
  {
    id: 'mongodb',
    name: 'MongoDB',
    icon: '🍃',
    description: 'Foundation Course for Web3 Wallet',
    color: '#22c55e',
    lessons: mongoLessons
  },
  {
    id: 'kafka',
    name: 'Kafka',
    icon: '📨',
    description: 'Foundation to Expert - Event Streaming Platform',
    color: '#e11d48',
    lessons: kafkaLessons
  }
]
