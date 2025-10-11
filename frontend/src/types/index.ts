export interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
  google_id: string;
  role: 'pending' | 'user' | 'admin';
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: number;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Cluster {
  id: number;
  name: string;
  description: string;
  context: string;
  created_by: number;
  created_at: string;
  updated_at: string;
  creator?: User;
}

export interface Namespace {
  metadata: {
    name: string;
    creationTimestamp: string;
  };
  status: {
    phase: string;
  };
}

export interface Pod {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  status: {
    phase: string;
    podIP: string;
  };
  spec: {
    containers: Array<{
      name: string;
      image: string;
    }>;
  };
}

export interface Deployment {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  status: {
    replicas: number;
    availableReplicas: number;
    readyReplicas: number;
  };
}

export interface Service {
  metadata: {
    name: string;
    namespace: string;
    creationTimestamp: string;
  };
  spec: {
    type: string;
    clusterIP: string;
    ports: Array<{
      port: number;
      targetPort: number | string;
      protocol: string;
    }>;
  };
}
