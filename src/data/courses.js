import { lessons as mongoLessons } from './lessons'
import { kafkaLessons } from './kafka-lessons'
import { javaMultithreadLessons } from './java-multithread-lessons'
import { rabbitmqLessons } from './rabbitmq-lessons'
import { javaCoreLessons } from './java-core-lessons'
import { sqlLessons } from './sql-lessons'
import { monitoringLessons } from './monitoring-lessons'

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
  },
  {
    id: 'java-core',
    name: 'Java OOP',
    icon: '☕',
    description: 'Foundation to Expert - OOP & Collections Framework',
    color: '#0ea5e9',
    lessons: javaCoreLessons
  },
  {
    id: 'sql',
    name: 'SQL & ACID',
    icon: '🗄️',
    description: 'Foundation to Expert - Relational Database & Transactions',
    color: '#06b6d4',
    lessons: sqlLessons
  },
  {
    id: 'monitoring',
    name: 'Monitoring',
    icon: '📊',
    description: 'Foundation to Expert - Observability & SRE Practices',
    color: '#f43f5e',
    lessons: monitoringLessons
  }
]
