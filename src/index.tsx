// src/main.tsx or src/index.tsx
import './index.css'; // or './global.css'


import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import App from "./App";
import InfluencerSignup from "./Pages/influencerSignup";
import Brands from "./Pages/BrandsSignup";
import Pricing from "./Pages/Pricing";
import Trust from "./Pages/Trust";
import GetStarted from "./Pages/GetStarted";
import BrandLogin from "./Pages/BrandsLogin";
import BrandDashboard from './Pages/BrandDashboard';
import InfluencerLogin from './Pages/influencerLogin';
import InfluencerDashboard from './Pages/influencerDashboard';
import ContactUs from './Pages/Contact';
import PrivacyPolicy from './Pages/Privacy&Policy';
import AboutUs from './Pages/About us';
import TermsAndConditions from './Pages/Term&conditions';
import CampaignPage from './Pages/campaign';
import CampaignForm from './Pages/campaignform';
import InfluencersPage from './Pages/influencerpage';
import InfluencerAnalytics from './Pages/influencerAnalytics';
import InfluencerCampaignsPage from './Pages/influencercampaign';
import Settings from './Pages/settings';
import BrandInfluencerFinder from './Pages/Brandinfluencerfinder';
import InfluencerProfile from './Pages/influencerprofile';
import BrandProfile from './Pages/Brandprofile';
import BrandInfluencerProfile from './Pages/BrandInfluencerProfile';
import CampaignDetails from './Pages/CampaignDetails';
import PastCampaigns from './Pages/PastCampaigns';
import InfluencerSponsorship from './Pages/InfluencerSponsorship';
import AppliedCampaignsPage from './Pages/appliedCampaigns';
import InfluencerAllCampaigns from './Pages/influencerAllCampaigns';
import ChatWithBrand from './Pages/chatwithBrand';
import ChatPage from './Pages/chatPage';


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/BrandsSignup" element={<Brands />} />
        <Route path="/influencerSignup" element={<InfluencerSignup />} />

        <Route path="/pricing" element={<Pricing />} />
        <Route path="/trust" element={<Trust />} />
        {/* <Route path="/launch" element={<Launch />} /> */}
        <Route path="/signup/influencer" element={<InfluencerSignup />} />
        <Route path="/get-started" element={<GetStarted />} />
        <Route path="/BrandsLogin" element={<BrandLogin />} />
        <Route path="/BrandDashboard" element={<BrandDashboard />} />
        <Route path="/influencerLogin" element={<InfluencerLogin />} />
        <Route path="/influencerDashboard" element={<InfluencerDashboard />} />
         <Route path="/Contact" element={<ContactUs />} />
         <Route path="/Privacy&Policy" element={<PrivacyPolicy />} />
         <Route path="/About us" element={<AboutUs />} />
          <Route path="/Term&condtions" element={<TermsAndConditions />} />
          <Route path="/campaign" element={<CampaignPage />} />
          <Route path="/campaignform" element={<CampaignForm />} />
          <Route path="/influencerpage" element={<InfluencersPage />} />
          <Route path="/influencerAnalytics" element={<InfluencerAnalytics />} />
           <Route path="/influencercampaign" element={<InfluencerCampaignsPage />} />
            <Route path="/settings" element={<Settings />} />
             <Route path="/Brandinfluencerfinder" element={<BrandInfluencerFinder />} />
             <Route path="/influencerprofile" element={<InfluencerProfile />} />
              <Route path="/Brandprofile" element={<BrandProfile />} />
              <Route path="/BrandInfluencerProfile/:id" element={<BrandInfluencerProfile />} />
              <Route path="/CampaignDetails/:id" element={<CampaignDetails />} />
              <Route path="/PastCampaigns" element={<PastCampaigns />} />
               <Route path="/InfluencerSponsorship" element={<InfluencerSponsorship />} />
                <Route path="/appliedCampaigns" element={<AppliedCampaignsPage />} />
                 <Route path="/influencerAllCampaigns" element={<InfluencerAllCampaigns />} />
                   <Route path="/chatwithBrand" element={<ChatWithBrand />} />
                   <Route path="/chat/:conversationId" element={<ChatWithBrand />} />
                   <Route path="chatPage" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
