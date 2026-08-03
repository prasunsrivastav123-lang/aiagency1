export class EmailProvider {
  async send() {
    throw new Error("send() not implemented");
  }

  async health() {
    return {
      status: "ok",
    };
  }
}