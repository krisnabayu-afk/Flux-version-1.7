import React from 'react';

export const DashboardHeader = ({ user }) => {
    return (
        <div>
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground mb-2">
                Welcome back, {user?.username}!
            </h1>
            <p className="text-lg text-muted-foreground">
                {user?.role} {user?.division && `- ${user.division}`}
            </p>
        </div>
    );
};
