"use client";
import ConnectGithubCard from "@/components/card/ConnectGithubCard";
import ErrorWrapper from "@/components/shared/ErrorWrapper";
import Spinner from "@/components/shared/Spinner";
import { useGetOrgIntegrationQuery } from "@/features/integration/useIntegrationQuery";
import { PropsWithChildren } from "react";

const DashboardLayout = ({ children }: PropsWithChildren) => {
    const { data: integrationData, isLoading: isOrgIntegrationLoading } = useGetOrgIntegrationQuery();
    console.log("Integration Data:", integrationData);
    
    const integrationExists = integrationData && Object.keys(integrationData).length>0;

    if (isOrgIntegrationLoading) {
        return <div className="flex items-center justify-center mt-20">
            <Spinner/>
        </div>
    }

    return <>
        {
            integrationExists ?
                <ErrorWrapper>
                    {children}
                </ErrorWrapper>
                :
                <div className="pt-10">
                    <ConnectGithubCard/>
                </div>
        }
    </>
}

export default DashboardLayout;