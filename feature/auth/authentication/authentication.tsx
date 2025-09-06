"use client";

import React, { useState } from 'react';
import { useTranslations } from "next-intl";
import { Tabs, Tab, Box } from '@mui/material';
import { withGuestOnly } from '@/component/auth/with-auth';
import { SignIn } from '@/feature/auth/sign-in';
import { SignUp } from '@/feature/auth/sign-up';
import { SocialAuth } from '@/feature/auth/social-auth';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`auth-tabpanel-${index}`}
      aria-labelledby={`auth-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index: number) {
  return {
    id: `auth-tab-${index}`,
    'aria-controls': `auth-tabpanel-${index}`,
  };
}

function Authentication() {
  const t = useTranslations();
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <div className="space-y-6 w-full">
      <Box>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="authentication tabs"
          variant="fullWidth"
        >
          <Tab label={t("sign_in")} {...a11yProps(0)} />
          <Tab label={t("sign_up")} {...a11yProps(1)} />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <SignIn />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <SignUp />
      </TabPanel>
      <SocialAuth />
    </div>
  );
}

export { Authentication };
export default withGuestOnly(Authentication);
