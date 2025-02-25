import axios from "axios";
import slugify from "slugify";

export const extendCollection = async (_chainId, metadata, tokenId) => {
  if (isNaN(Number(tokenId))) {
    throw new Error(`Invalid tokenId ${tokenId}`);
  }

  const startTokenId = tokenId - (tokenId % 1000000);
  const endTokenId = startTokenId + 1000000 - 1;

  const baseUrl = `${
    ![4, 5].includes(_chainId) ? "https://token.artblocks.io" : "https://token.staging.artblocks.io"
  }`;

  const url = `${baseUrl}/${metadata.contract}/${tokenId}`;
  const { data } = await axios.get(url);

  return {
    ...metadata,
    metadata: {
      ...metadata.metadata,
      imageUrl: data.image,
      description: data.description,
      externalUrl: data.website,
    },
    name: data.collection_name,
    slug: metadata.isFallback ? slugify(data.collection_name, { lower: true }) : metadata.slug,
    community: data.platform.toLowerCase(),
    id: `${metadata.contract}:${startTokenId}:${endTokenId}`.toLowerCase(),
    tokenIdRange: [startTokenId, endTokenId],
    tokenSetId: `range:${metadata.contract}:${startTokenId}:${endTokenId}`,
    isFallback: undefined,
  };
};

export const extend = async (_chainId, metadata) => {
  const startTokenId = metadata.tokenId - (metadata.tokenId % 1000000);
  const endTokenId = startTokenId + 1000000 - 1;

  const baseUrl = `${
    ![4, 5].includes(_chainId) ? "https://token.artblocks.io" : "https://token.staging.artblocks.io"
  }`;

  const url = `${baseUrl}/${metadata.contract}/${metadata.tokenId}`;
  const { data } = await axios.get(url);

  const imageUrl = metadata.imageUrl ?? data.image;
  const mediaUrl = metadata.mediaUrl ?? data.animation_url ?? data.generator_url;

  const attributes = [];
  // Add None value for core traits
  for (const [key, value] of Object.entries(data.features)) {
    attributes.push({
      key,
      rank: 1,
      value,
      kind: "string",
    });
  }

  return {
    ...metadata,
    attributes,
    imageUrl,
    mediaUrl,
    collection: `${metadata.contract}:${startTokenId}:${endTokenId}`.toLowerCase(),
  };
};
