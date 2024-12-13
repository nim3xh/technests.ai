import React from 'react';
import { Footer as FlowbiteFooter } from 'flowbite-react';

export default function Footer() {
  return (
    <FlowbiteFooter container={true} className="bg-gray-200 text-gray-900 p-6">
      <div className="w-full flex flex-col md:flex-row justify-between items-center">
        <div className="mb-4 md:mb-0">
          <FlowbiteFooter.Title
            title="Terms of Service"
            className="text-xl border-b-2 border-gray-300 pb-2"
          />
          <FlowbiteFooter.LinkGroup col={true}>
            <FlowbiteFooter.Link href="/terms-of-service">Terms of Service</FlowbiteFooter.Link>
            <FlowbiteFooter.Link href="/risk-disclaimer">Risk Disclaimer</FlowbiteFooter.Link>
            <FlowbiteFooter.Link href="/privacy-policy">Privacy Policy</FlowbiteFooter.Link>
            <FlowbiteFooter.Link href="/refund-policy">Refund Policy</FlowbiteFooter.Link>
            <FlowbiteFooter.Link href="/affiliate-agreement">Affiliate Agreement</FlowbiteFooter.Link>
            <FlowbiteFooter.Link href="/earnings-disclaimer">Earnings Disclaimer</FlowbiteFooter.Link>
            <FlowbiteFooter.Link href="/dmca">DMCA</FlowbiteFooter.Link>
          </FlowbiteFooter.LinkGroup>
        </div>
        <div className="text-center md:text-right">
          <FlowbiteFooter.Title
            title="Contact Us"
            className="text-xl border-b-2 border-gray-300 pb-2"
          />
          <FlowbiteFooter.LinkGroup col={true}>
            <p>1621 Central Avenue</p>
            <p>Cheyenne, WY 82001</p>
            <p>United States</p>
            <p>+1 (925) 315-4786</p>
            <FlowbiteFooter.Link href="mailto:support@blueedgefinancial.com">
              support@blueedgefinancial.com
            </FlowbiteFooter.Link>
          </FlowbiteFooter.LinkGroup>
        </div>
      </div>
    </FlowbiteFooter>
  );
}
