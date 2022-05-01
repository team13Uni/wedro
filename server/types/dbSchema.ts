export type DbSchema = {
  user: {
    name: string;
    email: string;
    password: string;
    role: "admin" | "user";
  };
  measurement: {
    temperature: number;
    humidity: number;
    measuredAt: string;
    nodeId: string;
    locationId: string;
  };
  location: {
    name: string;
    nodeId: string;
    state: "active" | "";
  };
  weatherStation: {};
};
