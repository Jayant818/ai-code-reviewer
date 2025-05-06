export default interface AIStrategy {
  getReview({ code }): Promise<any>;
  getPRReview({ code, fileContent }): Promise<any>;
  getSummary({ files }): Promise<any>;
}
