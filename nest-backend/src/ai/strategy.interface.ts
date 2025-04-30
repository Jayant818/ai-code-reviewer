export default interface AIStrategy {
  getReview({ code }): Promise<any>;
}
