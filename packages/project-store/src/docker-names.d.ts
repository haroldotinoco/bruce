declare module 'docker-names' {
  interface DockerNames {
    getRandomName: (appendNumber?: boolean | number) => string;
    adjectives: string[];
    surnames: string[];
  }
  const instance: DockerNames;
  export default instance;
}
