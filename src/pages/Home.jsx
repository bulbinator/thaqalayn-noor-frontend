import { useState } from "react";
import Chain from "../components/Chain";
import { LoadingOverlay, Divider, Paper, Group, Button, ActionIcon } from "@mantine/core";
import { getChain } from "../services/api";
import HadithSearch from "../components/HadithSearch";
import { useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { MdLightMode, MdDarkMode } from "react-icons/md";
import { FaGithub } from 'react-icons/fa';

function Home() {
  const [URL, setURL] = useState("");
  const [chains, setChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light');

  const toggleColorScheme = () => {
    setColorScheme(computedColorScheme === 'dark' ? 'light' : 'dark');
  };

  const handleURLSubmit = async (submittedURL) => {
    setLoading(true);
    setError(null);
    setURL(submittedURL);

    try {
      if (!submittedURL.startsWith("https://thaqalayn.net/hadith")) {
        throw new Error("URL must start with https://thaqalayn.net/hadith");
      }

      const book = submittedURL.replace("https://thaqalayn.net/hadith/", "").split("/");
      if (book.length > 1) {
        const bookId = book[0];
        const unsupportedBooks = ["34", "17", "33", "9"];
        if (unsupportedBooks.includes(bookId)) {
          throw new Error("The following books are not currently supported: Man Lā Yaḥḍuruh al-Faqīh, Muʿjam al-Aḥādīth al-Muʿtabara, Risālat al-Ḥuqūq, and Kitāb al-Ḍuʿafāʾ.");
        }
      }

      const fetchedChains = await getChain(submittedURL);
      if (!fetchedChains || fetchedChains.length === 0) {
        throw new Error("No chains found for the provided URL.");
      }
      setChains(fetchedChains);
    } catch (error) {
      setChains([]);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <LoadingOverlay visible={loading} overlayProps={{ blur: 2 }} />
      <div className="content-container">
        <div style={{ padding: '1rem' }}>
          <Group justify="flex-end" mb="md">
            <ActionIcon
              component="a"
              href="https://github.com/bulbinator/thaqalayn-noor"
              target="_blank"
              rel="noopener noreferrer"
              variant="default"
              size="xl"
              aria-label="GitHub"
            >
              <FaGithub size={20} />
            </ActionIcon>

            <ActionIcon
              onClick={toggleColorScheme}
              variant="default"
              size="xl"
              aria-label="Toggle color scheme"
            >
              {computedColorScheme === 'dark' ? (
                <MdLightMode size={20} />
              ) : (
                <MdDarkMode size={20} />
              )}
            </ActionIcon>
          </Group>
        </div>
        <div className="search-container">
          <Paper shadow="xl" radius="xl" withBorder p="xl">
            <HadithSearch onSubmit={handleURLSubmit} error={error} />
          </Paper>
        </div>
        <div className="chains-container">
          {chains &&
            chains.map((chain, index) => (
              <div key={index}>
                <Paper shadow="xl" radius="xl" withBorder p="xl">
                  <div className="english-text" style={{ fontSize: "1.8rem" }}>Chain {index + 1}:</div>
                  <Chain chain={chain} />
                </Paper>
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default Home;
