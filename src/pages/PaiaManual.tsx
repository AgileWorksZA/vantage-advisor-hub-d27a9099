import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const PaiaManual = () => {
  return (
    <div className="min-h-screen bg-background">
      <header className="bg-background/80 backdrop-blur border-b border-border">
        <div className="container flex items-center justify-between py-4">
          <a href="/" className="flex items-center gap-3" aria-label="Vantage home">
            <img src="/lovable-uploads/7dc6d80a-2f1f-4523-af0c-88abbde31835.png" alt="Vantage logo" className="h-6 md:h-7 w-auto" loading="eager" />
          </a>
          <Button asChild variant="outline" size="sm">
            <a href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </a>
          </Button>
        </div>
      </header>

      <main className="container py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-8">PAIA Manual</h1>
          
          <div className="prose prose-lg max-w-none space-y-6">
            <section>
              <h2 className="text-2xl font-semibold mb-4">1. Introduction</h2>
              <p className="mb-4">
                The Promotion of Access to Information Manual ("Manual") is published in terms of Section 51 of the Promotion of Access to Information Act No. 2 of 2000 ("PAIA"), as amended by the Protection of Personal Information Act No. 4 of 2013 ("POPIA"). This Manual gives effect to the constitutional right of access to information but recognizes limitations to this right including, but not limited to, the reasonable protection of privacy, commercial confidentiality, and good governance.
              </p>
              <p className="mb-4">The following annexures from part of this manual:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Annexure C: The Request for Access to a Copy of the Guide</li>
                <li>Annexure D: Request for Access to Records in terms of PAIA</li>
                <li>Annexure E: Fees in Respect of Access to Records</li>
                <li>Annexure F: Outcome of Request and Fees Payable</li>
                <li>Annexure G: Request for Record/Description of Personal Information in Terms of POPIA</li>
                <li>Annexure H: Objection to the Processing of Personal Information in Terms of POPIA</li>
                <li>Annexure I: Request for Correction/Deletion of Personal Information in Terms of POPIA</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">2. OBJECTIVE</h2>
              <p className="mb-4">
                This Manual will enable you to know what types of information we hold, the manner and form in which a request for information must be submitted in terms of PAIA and POPIA, and the grounds on which a request may be denied. It further defines how you may object to the processing of your personal information and/or request a correction or deletion of your personal information.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">3. SCOPE AND OVERVIEW</h2>
              <p className="mb-4">
                Vantage Technologies (Pty) Ltd is a private company duly incorporated in the Republic of South Africa and is the holding company of subsidiaries and associated companies providing diversified financial services. The Vantage Group and it subsidiaries will collectively be referred to as "the Vantage Group" in this Manual. The list of Vantage Group entities that for part of the scope of this Manual are as follows:
              </p>
              <ul className="list-disc pl-6 mb-4">
                <li>Vantage Technologies (Pty) Ltd</li>
                <li>Vantage Invest (Pty) Ltd</li>
                <li>Vantage Nominees (RF) (Pty) Ltd</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">4. DEFINITIONS</h2>
              <p className="mb-4">In this Manual, unless the context otherwise indicates:</p>
              
              <div className="mb-4">
                <p className="mb-2"><strong>"client"</strong> means any natural or juristic entity that receives services from Vantage Group;</p>
                <p className="mb-2"><strong>"data subject"</strong> means the person to whom personal information relates as defined in POPIA;</p>
                <p className="mb-2"><strong>"employee"</strong> means full-time and part-time employees, whether temporary or permanent, including directors and other contract workers;</p>
                <p className="mb-2"><strong>"personal information"</strong> means information relating to you that includes, but is not limited to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>information relating to race, gender, sex, pregnancy, marital status, nationality, ethnic or social origin, colour, sexual orientation, age, physical or mental health, well-being, disability, religion, conscience, belief, culture, language and birth;</li>
                  <li>information relating to education, medical, financial, criminal or employment history;</li>
                  <li>any identifying number, symbol, e-mail address, physical address, telephone number, location information, online identifier or other particular assignment to you;</li>
                  <li>biometric information;</li>
                  <li>personal opinions, views or preferences;</li>
                  <li>correspondence sent by you that is implicitly or explicitly of a private or confidential nature, or further correspondence that would reveal the contents of the original correspondence;</li>
                  <li>your opinions or views about another individual; and</li>
                  <li>your name, if it appears with other personal information relating to you, or if the disclosure of your name itself would reveal information about you;</li>
                </ul>
                <p className="mb-2"><strong>"record"</strong> means any recorded information:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>regardless of form or medium;</li>
                  <li>in the possession or under the control of Vantage Group, respectively; and</li>
                  <li>whether or not it was created by Vantage Group, respectively;</li>
                </ul>
                <p className="mb-2"><strong>"requestor"</strong> means the person requesting access to the records.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">5. CONTACT DETAILS</h2>
              <div className="mb-4">
                <p className="mb-2"><strong>Contact person:</strong> Emile Wegner</p>
                <p className="mb-2"><strong>Telephone number:</strong> +27 11 502 8800</p>
                <p className="mb-2"><strong>E-mail address:</strong> hello@vantage.co.za</p>
                <p className="mb-2"><strong>Website address:</strong> www.vantage.co.za</p>
                <p className="mb-2"><strong>Head Office physical address:</strong> Silverstream Business Park, Muswell Road, Bryanston, South Africa</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">6. INFORMATION REGULATOR'S GUIDE</h2>
              <p className="mb-4">
                The Information Regulator compiled an official Guide which contains information to assist a person wishing to exercise a right of access to information in terms of PAIA and POPIA. The Guide is also available in English and Afrikaans at the offices of Vantage Group or by requesting it from the Information Officer. Any request for public inspection of the Guide at the office of the Information Regulator or a request for a copy of the Guide from the Information Officer must substantially correspond with ANNEXURE C.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">7. CATEGORIES OF RECORDS HELD BY VANTAGE GROUP</h2>
              <p className="mb-4">
                The categories of records held by Vantage Group are listed below, according to the respective departments. A category of record in this Manual does not imply that a request for access to such a record will be granted. All requests for access are evaluated on a case-by-case basis by the Information Officer. All information on our website is automatically available and there is no need to formally request this in terms of this Manual.
              </p>

              <div className="space-y-6">
                <div>
                  <h3 className="text-xl font-semibold mb-3">Company Secretarial and Legal</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Statutory company records</li>
                    <li>Minutes and related meeting information</li>
                    <li>Records of executive, board and shareholder decisions, and related documentation</li>
                    <li>Trademark information</li>
                    <li>General agreement documentation</li>
                    <li>Securities and equities</li>
                    <li>Terms of reference for board and board committees</li>
                    <li>Shareholder information</li>
                    <li>Legally privileged material</li>
                    <li>Internal legal opinions</li>
                    <li>Legal policies and procedures</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Compliance</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Compliance policies and procedures</li>
                    <li>Regulatory and industry body reports</li>
                    <li>Compliance reports</li>
                    <li>Complaints register</li>
                    <li>Gifts register</li>
                    <li>Training register</li>
                    <li>Conflict of Interest register</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Executive Office</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Strategic plans</li>
                    <li>Research information belonging to Vantage Group, whether conducted itself or commissioned from a third party</li>
                    <li>Succession plans</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Finance</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Invoices</li>
                    <li>Finance-related policies and procedures</li>
                    <li>Audit records</li>
                    <li>Annual financial statements</li>
                    <li>Asset register</li>
                    <li>Rental agreements</li>
                    <li>Bank statements</li>
                    <li>Management accounts</li>
                    <li>Tax, VAT and PAYE records</li>
                    <li>Payroll</li>
                    <li>Procurement records</li>
                    <li>Service provider information</li>
                    <li>Professional indemnity insurance</li>
                    <li>Going concern assessment</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Human Resources</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Employee records</li>
                    <li>Employment contracts</li>
                    <li>Employment-related policies and procedures</li>
                    <li>Health and safety records</li>
                    <li>Employment equity records</li>
                    <li>Training/learning and development records</li>
                    <li>Job applicant information</li>
                    <li>Reports to industry body</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Information Technology</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Information technology policies and procedures</li>
                    <li>Disaster recovery plan and tests</li>
                    <li>System security tests</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Marketing</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Market information</li>
                    <li>Media releases</li>
                    <li>The Vantage Group legal structure</li>
                    <li>Internal publications and newsletters</li>
                    <li>Client communication by e-mail or SMS</li>
                    <li>Advertising and promotional material (including marketing brochures)</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Operational</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Records provided by clients</li>
                    <li>Records provided by third parties regarding clients</li>
                    <li>Records provided by clients' financial advisors</li>
                    <li>Clients' transactional records</li>
                    <li>Correspondence with clients</li>
                    <li>Service agreements entered into with third parties</li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-xl font-semibold mb-3">Risk</h3>
                  <ul className="list-disc pl-6 mb-4">
                    <li>Risk Register</li>
                    <li>Internal audit plan and reports</li>
                    <li>Risk Policies and Procedures</li>
                    <li>Risk Reports</li>
                    <li>Business continuity plan</li>
                  </ul>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">8. RECORDS AVAILABLE IN TERMS OF OTHER APPLICABLE LEGISLATION</h2>
              <p className="mb-4">Records may also be available in terms of, among others, the following list of legislation:</p>
              <ul className="list-disc pl-6 mb-4">
                <li>Basic Conditions of Employment Act No. 75 of 1997</li>
                <li>Broad-Based Black Economic Empowerment Act No. 53 of 2003</li>
                <li>Companies Act No. 71 of 2008</li>
                <li>Compensation for Occupational Injuries and Diseases Act No. 130 of 1993</li>
                <li>Employment Equity Act No. 55 of 1998</li>
                <li>Financial Advisory and Intermediary Services Act No. 37 of 2002</li>
                <li>Financial Intelligence Centre Act</li>
                <li>Financial Markets Act No. 19 of 2022</li>
                <li>Financial Sector Regulation Act No. 9 of 2017</li>
                <li>Income Tax Act No. 58 of 1962</li>
                <li>Insurance Act No. 18 of 2017</li>
                <li>Labour Relations Act No. 66 of 1995</li>
                <li>Long-Term Insurance Act No. 52 of 1998</li>
                <li>Medical Schemes Act No. 131 of 1998</li>
                <li>Occupational Health and Safety Act No. 85 of 1993</li>
                <li>Pension Funds Act No. 24 of 1956</li>
                <li>Prevention and Combating of Corrupt Activities Act No. 12 of 2004</li>
                <li>Prevention of Organised Crime Act No. 121 of 1998</li>
                <li>Protected Disclosures Act No. 26 of 2000</li>
                <li>Protection of Constitutional Democracy Against Terrorist and Related Activities Act No. 33 of 2004</li>
                <li>Short-Term Insurance Act No. 53 of 1998</li>
                <li>Skills Development Act No. 97 of 1998</li>
                <li>Tax Administration Act No. 28 of 2011</li>
                <li>Unemployment Insurance Act No. 30 of 1966</li>
                <li>Value-Added Tax Act No. 89 of 1991</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">9. REQUEST PROCEDURE FOR ACCESS TO RECORDS IN TERMS OF PAIA</h2>
              <div className="space-y-4">
                <p><strong>9.1</strong> The requestor must complete the prescribed form, included in ANNEXURE D of this Manual. The request form must be addressed to the Information Officer using the contact details in this Manual. All requests will be evaluated and considered by the Information Officer.</p>
                <p><strong>9.2</strong> The request form must be completed in full. Any request for access to a record that does not comply with the formalities as prescribed by PAIA will be returned to the requestor.</p>
                <p><strong>9.3</strong> Vantage Group will not be held liable for delays owing to the receipt of incomplete forms.</p>
                <p><strong>9.4</strong> Proof of identity is required to authenticate the identity of the requestor. If the requestor acts as an agent, proof of the identity of the agent and of the requestor is required, as well as the authority or mandate given to the agent of the requestor.</p>
                <p><strong>9.5</strong> Vantage Group requests a fee to enable it to recover the cost of processing a request for records and providing access to records. The fees are outlined in ANNEXURE E of this Manual.</p>
                <p><strong>9.6</strong> A bank deposit is the only accepted payment method for record requests. The Information Officer will provide banking details and an estimate of the fees payable upon receipt of a request for access to a record. A request for access to records will only be considered once a fully completed form and the prescribed request fee have been received by the Information Officer.</p>
                <p><strong>9.7</strong> Requests for access to records will be processed within 30 (thirty) days, unless a request contains considerations that are of such a nature that an extension of the time limit is needed. Should an extension be required, you will be notified, together with reasons explaining why the extension is necessary. If the Information Officer decides to grant you access to the record, such access must be granted within 30 (thirty) days of being informed of the decision.</p>
                <p><strong>9.8</strong> The Information Officer shall decide whether to grant the requested access to records and inform the requestor accordingly. Section 17 of PAIA stipulates that the disclosure of a record is compulsory if the disclosure reveals evidence of a substantial contravention of, or failure to comply with, the law, or if there is an imminent and serious public-safety or environmental risk and the public interest in the disclosure of the record in question clearly outweighs the harm contemplated by its disclosure. The requestor shall be notified of the decision in the most expedient manner possible. If the Information Officer has searched for a record and it is believed that the record either does not exist or cannot be found, the requestor will be notified accordingly. The notification will include a summary of all the steps taken to find the record in question or to determine whether the record exists.</p>
                <p><strong>9.9</strong> If the request for access to a record affects a third party, then such third party must first be informed of the request by the Information Officer as soon as possible within 21 (twenty-one) days of receipt of the request. The third party would then have a further 21 (twenty-one) days to make representations and/or submissions regarding the granting of access to the record. If the request for access to information is refused by the Information Officer, the requestor shall be provided with written reasons for such refusal.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">10. GROUNDS FOR THE REFUSAL OF ACCESS IN TERMS OF PAIA</h2>
              <p className="mb-4">There are various grounds upon which a request for access to a record may be refused in terms of PAIA. These grounds include:</p>
              <div className="space-y-4">
                <div>
                  <p><strong>10.1</strong> The protection of personal information of a third person (who is a natural person) from unreasonable disclosure if the record contains:</p>
                  <ul className="list-disc pl-6 ml-4">
                    <li><strong>10.1.1</strong> trade secrets of that third party;</li>
                    <li><strong>10.1.2</strong> financial, commercial, scientific, or technical information, of which disclosure could likely cause harm to the financial or commercial interests of that third party; and/or</li>
                    <li><strong>10.1.3</strong> information disclosed in confidence by a third party to Vantage Group.</li>
                  </ul>
                </div>
                <p><strong>10.2</strong> The disclosure of the record could put that third party at a disadvantage in negotiations or commercial competition.</p>
                <p><strong>10.3</strong> The protection of confidential information if the disclosure would constitute a breach of a duty or confidence to a third party in terms of an agreement.</p>
                <p><strong>10.4</strong> The protection of confidential information of third parties if it is protected in terms of any agreement or legislation.</p>
                <p><strong>10.5</strong> The protection of the safety of individuals and the protection of property.</p>
                <p><strong>10.6</strong> The protection of records which would be regarded as privileged in legal proceedings.</p>
                <div>
                  <p><strong>10.7</strong> The protection of commercial activities of Vantage Group, which may include:</p>
                  <ul className="list-disc pl-6 ml-4">
                    <li><strong>10.7.1</strong> trade secrets;</li>
                    <li><strong>10.7.2</strong> financial, commercial, scientific, or technical information, of which disclosure could likely cause harm to the financial or commercial interests of Vantage Group;</li>
                    <li><strong>10.7.3</strong> information which, if disclosed, could put Vantage Group at a disadvantage in negotiations or commercial competition; and</li>
                    <li><strong>10.7.4</strong> a computer program which is owned by Vantage Group and which is protected by copyright.</li>
                  </ul>
                </div>
                <p><strong>10.8</strong> The protection of research information of Vantage Group or a third party which disclosure would disclose the identity of the institution, the researcher or the subject matter of the research and would place the research at a serious disadvantage.</p>
                <p><strong>10.9</strong> Requests for information that are clearly frivolous or vexatious, or which involve an unreasonable diversion of resources shall be refused.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">11. REMEDIES AVAILABLE TO A REQUESTOR ON THE REFUSAL OF ACCESS</h2>
              <div className="space-y-4">
                <p><strong>11.1</strong> There is no internal appeal procedure after a request to access information has been refused. The decision made by the Information Officer is final. If a requestor is not satisfied with the outcome of the request, they are entitled take the matter further by applying to the Information Regulator or a court of competent jurisdiction, within 180 (one hundred and eighty) days of the decision.</p>
                <p><strong>11.2</strong> Where a third party is affected by the request for access, and the Information Officer has decided to grant access to a record, the third party has 180 (one hundred and eighty) days to appeal the decision in court.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">12. PROCESSING PERSONAL INFORMATION IN TERMS OF POPIA</h2>
              <div className="space-y-4">
                <p><strong>12.1</strong> Vantage Group will collect, use, and share your personal information in accordance with its Privacy Policy. The Privacy Policy is also available on our website or upon request from the Information Officer.</p>
                <p><strong>12.2</strong> In terms of POPIA you may, upon proof of identity, request Vantage Group to confirm, free of charge, the personal information we hold about you. To exercise this right, please contact our Information Officer.</p>
                <p><strong>12.3</strong> You may request a record, or a description of the personal information held by Vantage Group about you, including information about the identity of all third parties, or categories of third parties, who have, or have had, access to your personal information. To do so, complete the request form in ANNEXURE G to this Manual and submit the request to the Information Officer. You may be required to pay a fee for this service, as indicated in ANNEXURE H. The Information Officer will provide you with the amount payable before providing the service, including the banking details that the fees must be paid into.</p>
                <p><strong>12.4</strong> You may object at any time, free of charge, to the processing of personal information by Vantage Group, on reasonable grounds, unless legislation provides for such processing. If you want to object to the processing of your personal information, please complete the prescribed form attached hereto as ANNEXURE H and submit it to the Information Officer.</p>
                <p><strong>12.5</strong> You may request Vantage Group to correct the personal information held about you if it is inaccurate, irrelevant, excessive, outdated, incomplete, misleading or has been obtained unlawfully. To request the correction of your personal information you would need to complete ANNEXURE I to the Manual. This form must be submitted to the Information Officer.</p>
                <p><strong>12.6</strong> If you wish Vantage Group to destroy or delete a record of personal information about you that we are no longer authorised to retain in terms of POPIA, please complete ANNEXURE J to this Manual and submit it to the Information Officer.</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold mb-4">13. AVAILABILITY OF THIS MANUAL</h2>
              <p className="mb-4">
                This Manual will be available on our website (www.vantage.co.za) or by submitting a request for a copy thereof to the Information Officer. To do so, use the contact details in clause 5 of this Manual.
              </p>
              <p className="mb-4">
                To download the annexures mentioned above{" "}
                <a 
                  href="/downloads/Vantage-PAIA-Manual-Annexures.pdf" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-primary underline hover:text-primary/80"
                >
                  please click here
                </a>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PaiaManual;