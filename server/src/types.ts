// GPU information interface
export interface GpuInfo {
  id: number;
  name: string;
  usage: number;
  memory: {
    used: number;
    total: number;
  };
}

// System information interface
export interface SystemInfo {
  cpu: {
    usage: number;
    cores: number;
    threads: number;
  };
  memory: {
    used: number;
    total: number;
  };
  gpus: GpuInfo[];
}