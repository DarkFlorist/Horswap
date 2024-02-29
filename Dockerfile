# ---------------------------------------------
# App Setup: Install dependencies and build app
# ---------------------------------------------

FROM node:18.19.0-alpine3.18@sha256:c0a5f02df6e631b75ee3037bd4389ac1f91e591c5c1e30a0007a7d0babcd4cd3 as builder

# Get git
RUN apk add --no-cache git

# Installaton
WORKDIR /source
COPY ./scripts/ /source/scripts/
COPY ./src/ /source/src/
COPY ./lingui.config.ts /source/lingui.config.ts
COPY ./package.json /source/package.json
COPY ./yarn.lock /source/yarn.lock
RUN yarn install --frozen-lockfile

# Build the app
COPY ./craco.config.cjs /source/craco.config.cjs
COPY ./tsconfig.json /source/tsconfig.json
COPY ./public/ /source/public/
COPY ./.git /source/.git
COPY ./.eslintrc.js /source/.eslintrc.js
COPY ./.swcrc /source/.swcrc
RUN yarn run build

# --------------------------------------------------------
# Base Image: Create the base image that will host the app
# --------------------------------------------------------

# Cache the kubo image
FROM ipfs/kubo:v0.25.0@sha256:0c17b91cab8ada485f253e204236b712d0965f3d463cb5b60639ddd2291e7c52 as ipfs-kubo

# Create the base image
FROM debian:12.2-slim@sha256:93ff361288a7c365614a5791efa3633ce4224542afb6b53a1790330a8e52fc7d

# Add curl to the base image (7.88.1-10+deb12u5)
# Add jq to the base image (1.6-2.1)
RUN apt-get update && apt-get install -y curl=7.88.1-10+deb12u5 jq=1.6-2.1

# Install kubo and initialize ipfs
COPY --from=ipfs-kubo /usr/local/bin/ipfs /usr/local/bin/ipfs

# Copy app's build output and initialize IPFS api
COPY --from=builder /source/build /export
RUN ipfs init
RUN ipfs add --cid-version 1 --quieter --only-hash -r /export > ipfs_hash.txt

# --------------------------------------------------------
# Publish Script: Option to host app locally or on nft.storage
# --------------------------------------------------------

WORKDIR ~
COPY <<'EOF' /entrypoint.sh
#!/bin/sh
set -e

if [ $# -ne  1 ]; then
	echo "Example usage: docker run --rm ghcr.io/darkflorist/horswap:latest [docker-host|nft.storage]"
	exit  1
fi

case $1 in

	docker-host)
		# Show the IFPS build hash
		echo "Build Hash: $(cat /ipfs_hash.txt)"

		# Determine the IPV4 address of the docker-hosted IPFS instance
		IPFS_IP4_ADDRESS=$(getent ahostsv4 host.docker.internal | grep STREAM | head -n 1 | cut -d ' ' -f 1)

		echo "Adding files to docker running IPFS at $IPFS_IP4_ADDRESS"
		IPFS_HASH=$(ipfs add --api /ip4/$IPFS_IP4_ADDRESS/tcp/5001 --cid-version 1 --quieter -r /export)
		echo "Uploaded Hash: $IPFS_HASH"
		;;

	nft.storage)
		if [ -z $NFTSTORAGE_API_KEY ] || [ $NFTSTORAGE_API_KEY = "" ]; then
			echo "NFTSTORAGE_API_KEY environment variable is not set";
			exit  1;
		fi

		# Show the IFPS build hash
		echo "Build Hash: $(cat /ipfs_hash.txt)"

		# Create a CAR archive from build hash
		echo "Uploading files to nft.storage..."
		IPFS_HASH=$(ipfs add --cid-version 1 --quieter -r /export)
		ipfs dag export $IPFS_HASH > output.car

		# Upload the entire directory to nft.storage
		UPLOAD_RESPONSE=$(curl \
			--request POST \
			--header "Authorization: Bearer $NFTSTORAGE_API_KEY" \
			--header "Content-Type: application/car" \
			--data-binary @output.car \
			--silent \
			https://api.nft.storage/upload)

		# Show link to nft.storage (https://xxx.ipfs.nftstorage.link)
		UPLOAD_SUCCESS=$(echo "$UPLOAD_RESPONSE" | jq -r ".ok")

		if [ "$UPLOAD_SUCCESS" = "true" ]; then
			echo "Succesfully uploaded to https://"$(echo "$UPLOAD_RESPONSE" | jq -r ".value.cid")".ipfs.nftstorage.link"
		else
			echo "Upload Failed: " $(echo "$UPLOAD_RESPONSE" | jq -r ".error | @json")
		fi
		;;

	*)
		echo "Invalid option: $1"
		echo "Example usage: docker run --rm ghcr.io/darkflorist/horswap:latest [docker-host|nft.storage]"
		exit  1
		;;
esac
EOF

RUN chmod u+x /entrypoint.sh

ENTRYPOINT [ "/entrypoint.sh" ]
