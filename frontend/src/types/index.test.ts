import { User, Cluster, Pod, Deployment, Service } from './index';

describe('Type Definitions', () => {
  test('User interface has correct structure', () => {
    const user: User = {
      id: 1,
      email: 'test@example.com',
      name: 'Test User',
      picture: 'http://example.com/pic.jpg',
      google_id: 'google123',
      role: 'user',
      status: 'approved',
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    expect(user.id).toBe(1);
    expect(user.email).toBe('test@example.com');
    expect(user.role).toBe('user');
  });

  test('Cluster interface has correct structure', () => {
    const cluster: Cluster = {
      id: 1,
      name: 'test-cluster',
      description: 'Test cluster',
      context: 'default',
      created_by: 1,
      created_at: '2024-01-01T00:00:00Z',
      updated_at: '2024-01-01T00:00:00Z',
    };

    expect(cluster.name).toBe('test-cluster');
    expect(cluster.created_by).toBe(1);
  });

  test('Pod interface has correct structure', () => {
    const pod: Pod = {
      metadata: {
        name: 'test-pod',
        namespace: 'default',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        phase: 'Running',
        podIP: '10.0.0.1',
      },
      spec: {
        containers: [
          {
            name: 'nginx',
            image: 'nginx:latest',
          },
        ],
      },
    };

    expect(pod.metadata.name).toBe('test-pod');
    expect(pod.status.phase).toBe('Running');
  });

  test('Deployment interface has correct structure', () => {
    const deployment: Deployment = {
      metadata: {
        name: 'test-deployment',
        namespace: 'default',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      status: {
        replicas: 3,
        availableReplicas: 3,
        readyReplicas: 3,
      },
    };

    expect(deployment.metadata.name).toBe('test-deployment');
    expect(deployment.status.replicas).toBe(3);
  });

  test('Service interface has correct structure', () => {
    const service: Service = {
      metadata: {
        name: 'test-service',
        namespace: 'default',
        creationTimestamp: '2024-01-01T00:00:00Z',
      },
      spec: {
        type: 'ClusterIP',
        clusterIP: '10.0.0.100',
        ports: [
          {
            port: 80,
            targetPort: 8080,
            protocol: 'TCP',
          },
        ],
      },
    };

    expect(service.metadata.name).toBe('test-service');
    expect(service.spec.type).toBe('ClusterIP');
  });
});
