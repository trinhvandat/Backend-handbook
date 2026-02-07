import { lessons as mongoLessons } from './lessons'
import { kafkaLessons } from './kafka-lessons'
import { javaMultithreadLessons } from './java-multithread-lessons'
import { rabbitmqLessons } from './rabbitmq-lessons'

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
  },
  {
    id: 'java-multithread',
    name: 'Java Threads',
    icon: '🧵',
    description: 'Foundation to Expert - Concurrency & JVM Internals',
    color: '#f97316',
    lessons: javaMultithreadLessons
  },
  {
    id: 'rabbitmq',
    name: 'RabbitMQ',
    icon: '🐇',
    description: 'Foundation to Expert - Message Broker & AMQP',
    color: '#7c3aed',
    lessons: rabbitmqLessons
  }
]
