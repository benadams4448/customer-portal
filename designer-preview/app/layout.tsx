import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../../app/globals.css";
import "../../styles/globals.css";

export const metadata: Metadata = {
  title: "Client workspace · Design preview",
  description: "Interactive sample workspace for design review. No real client data.",
  robots: { index: false, follow: false },
};

const DesignerLayout = ({ children }: { children: ReactNode }) => (
  <html lang="en">
    <body>{children}</body>
  </html>
);

export default DesignerLayout;
