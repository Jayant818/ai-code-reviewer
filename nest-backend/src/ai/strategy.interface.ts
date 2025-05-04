export default interface AIStrategy {
  getReview({ code }): Promise<any>;
  getPRReview({ code }): Promise<any>;
  getSummary({ files }): Promise<any>;
}
