import request, { gql } from "graphql-request";

export type GraphQLResponse<K> = {
  round: K;
};

export const gqlRequest = async (
  document: any,
  variable: any
): Promise<any> => {
  try {
    return await request(
      `https://beta.indexer.gitcoin.co/v1/graphql`,
      document,
      variable,
      {
        "content-type": "application/json",
        "x-hasura-admin-secret": process.env.INDEXER_PASSWORD || "",
      }
    );
  } catch (error) {
    console.log(`Request failed, refreshing in 2 seconds`);
    await new Promise((res) => setTimeout(res, 2000));
    return await gqlRequest(document, variable);
  }
};

export const getRounds = async (chainId: number) => {
  return gqlRequest(
    gql`
      query getRounds($chainId: Int = 10) {
        rounds(where: { chainId: { _eq: $chainId } }) {
          id
          chainId
          applicationMetadata
          applicationMetadataCid
          applicationsEndTime
          applicationsStartTime
          createdAtBlock
          donationsEndTime
          donationsStartTime
          managerRole
          matchAmount
          matchAmountInUsd
          matchTokenAddress
          projectId
          roundMetadata
          roundMetadataCid
          strategyAddress
          strategyId
          strategyName
          tags
          totalAmountDonatedInUsd
          totalDonationsCount
          uniqueDonorsCount
          updatedAtBlock
        }
      }
    `,
    { chainId }
  );
};

export const getApplications = async ({
  chainId,
  roundId,
}: {
  chainId: number;
  roundId: string;
}) => {
  return gqlRequest(
    gql`
      query getApplications($roundId: String = "", $chainId: Int = 10) {
        rounds(where: { chainId: { _eq: $chainId }, id: { _eq: $roundId } }) {
          applications {
            id
            projectId
            roundId
            status
            metadataCid
            uniqueDonorsCount
            totalDonationsCount
            totalAmountDonatedInUsd
            statusUpdatedAtBlock
            createdAtBlock
            chainId
            metadata
          }
        }
      }
    `,
    { chainId, roundId }
  );
};

export const getVotes = async ({
  chainId,
  roundId,
}: {
  chainId: number;
  roundId: string;
}) => {
  return gqlRequest(
    gql`
      query getVotes($roundId: String = "", $chainId: Int = 10) {
        rounds(where: { chainId: { _eq: $chainId }, id: { _eq: $roundId } }) {
          donations {
            amount
            amountInRoundMatchToken
            amountInUsd
            applicationId
            blockNumber
            chainId
            donorAddress
            id
            projectId
            recipientAddress
            roundId
            tokenAddress
            transactionHash
          }
        }
      }
    `,
    { chainId, roundId }
  );
};

export const getTokenPrice = async ({ tokenCode }: { tokenCode: string }) => {
  return gqlRequest(
    gql`
      query getTokenPrice($tokenCode: String = "") {
        priceCache(
          orderBy: BLOCK_NUMBER_DESC
          filter: { tokenCode: { equalTo: $tokenCode } }
          limit: 1
        ) {
          id
          priceUsd
        }
      }
    `,
    { tokenCode }
  );
};
