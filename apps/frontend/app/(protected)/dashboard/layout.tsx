"use client";
import ConnectGithubCard from "@/components/card/ConnectGithubCard";
import ErrorWrapper from "@/components/shared/ErrorWrapper";
import Spinner from "@/components/shared/Spinner";
import { useGetOrgSubscriptionQuery } from "@/features/subscription/useSubscriptionQuery";
import { useGetCurrentUserDetailQuery } from "@/features/user/useUserQuery";
import { PropsWithChildren } from "react";

const DashboardLayout = ({ children }: PropsWithChildren) => {
    const { data: user, isLoading: isUserLoading } = useGetCurrentUserDetailQuery();
    
    const { subscription: userSubscription } = useGetOrgSubscriptionQuery({
        orgId: user?.orgId ?? "" , 
        customConfig: {
            enabled: !!user?.orgId,
        }
    });

    const orgExists = user?.orgId !== null;

    if (isUserLoading) {
        return <div className="flex items-center justify-center mt-20">
            <Spinner/>
            </div>
    }

    return <>
        {
            orgExists ?
                <ErrorWrapper>
                    {children}
                </ErrorWrapper>
                :
                <div className="pt-10">
                    {/* {JSON.stringify(user)} */}
                    <ConnectGithubCard/>
                </div>
        }
    </>
}

export default DashboardLayout;