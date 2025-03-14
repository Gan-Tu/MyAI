import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Row,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

interface BackupNotificationEmailProps {
  backupLocation: string;
  backupFiles: string;
}

export default function BackupNotificationEmail({
  backupLocation,
  backupFiles,
}: BackupNotificationEmailProps) {
  const formattedDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const backupTime = new Date().toLocaleTimeString("en-US", {
    timeZone: "America/New_York",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  return (
    <Html>
      <Head />
      <Preview>
        Backup Complete: MyAI data has been successfully backed up
      </Preview>
      <Tailwind>
        <Body className="bg-gray-100 font-sans">
          <Container className="mx-auto my-[40px] max-w-[600px] rounded-md bg-white p-[24px] shadow-sm">
            <Section className="mb-[32px] border-b border-gray-200 pb-[24px] text-center">
              <Heading className="mb-[16px] text-[24px] font-bold text-gray-800">
                Backup Successfully Completed
              </Heading>
            </Section>

            <Section className="mb-[32px]">
              <Row>
                <Column>
                  <Text className="mb-[24px] text-[16px] text-gray-700">
                    Hello there,
                  </Text>

                  <Text className="mb-[24px] text-[16px] text-gray-700">
                    We&apos;re happy to inform you that <strong>MyAI</strong>{" "}
                    has successfully completed its backup of your application
                    data to Dropbox. Your data is now safely stored and ready if
                    you ever need to restore it.
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section className="mb-[32px] rounded-md bg-blue-50 p-[24px]">
              <Heading className="mb-[16px] text-[18px] font-bold text-gray-800">
                Backup Details
              </Heading>

              <Row className="mb-[12px]">
                <Column className="w-[150px]">
                  <Text className="m-0 text-[14px] text-gray-500">
                    Application:
                  </Text>
                </Column>
                <Column>
                  <Text className="m-0 text-[14px] font-medium text-gray-800">
                    MyAI
                  </Text>
                </Column>
              </Row>

              <Row className="mb-[12px]">
                <Column className="w-[150px]">
                  <Text className="m-0 text-[14px] text-gray-500">Date:</Text>
                </Column>
                <Column>
                  <Text className="m-0 text-[14px] font-medium text-gray-800">
                    {formattedDate}
                  </Text>
                </Column>
              </Row>

              <Row className="mb-[12px]">
                <Column className="w-[150px]">
                  <Text className="m-0 text-[14px] text-gray-500">Time:</Text>
                </Column>
                <Column>
                  <Text className="m-0 text-[14px] font-medium text-gray-800">
                    {backupTime}, EDT
                  </Text>
                </Column>
              </Row>

              <Row className="mb-[12px]">
                <Column className="w-[150px]">
                  <Text className="m-0 text-[14px] text-gray-500">
                    Location:
                  </Text>
                </Column>
                <Column>
                  <Text className="m-0 text-[14px] font-medium text-gray-800">
                    {backupLocation}
                  </Text>
                </Column>
              </Row>

              <Row>
                <Column className="w-[150px]">
                  <Text className="m-0 text-[14px] text-gray-500">Files:</Text>
                </Column>
                <Column>
                  <Text className="m-0 text-[14px] font-medium text-gray-800">
                    {backupFiles}
                  </Text>
                </Column>
              </Row>
            </Section>

            <Section>
              <Text className="text-[16px] text-gray-700">
                Best regards,
                <br />
                The MyAI Team
              </Text>
            </Section>

            <Section className="mt-[32px] border-t border-gray-200 pt-[24px]">
              <Text className="m-0 text-[12px] text-gray-500">
                © {new Date().getFullYear()} MyAI. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
