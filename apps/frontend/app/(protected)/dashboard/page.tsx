import { Metadata } from "next";
import DashboardWrapper from "./DashboardWrapper";


export const metadata: Metadata = {
  title: "Dashboard | AI Code Reviewer" ,
}

const Page = () => {
  return <DashboardWrapper />;
}

export default Page;
